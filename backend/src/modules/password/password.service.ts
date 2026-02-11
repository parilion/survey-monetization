import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AccessPassword } from '../../entities/access-password.entity';
import { Survey } from '../../entities/survey.entity';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(AccessPassword)
    private readonly passwordRepo: Repository<AccessPassword>,
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 验证密码
   * 核心逻辑：
   * 1. 查询密码
   * 2. 检查是否已过期（status=1 或 时间过期）
   * 3. 不标记已使用，允许12小时内重复使用
   * 4. 返回密码信息
   */
  async verifyPassword(dto: VerifyPasswordDto) {
    // 1. 查询密码
    const password = await this.passwordRepo.findOne({
      where: { password: dto.password },
      relations: ['survey'],
    });

    if (!password) {
      throw new HttpException('密码无效', HttpStatus.BAD_REQUEST);
    }

    // 2. 检查是否已过期（status=1 或 时间过期）
    const now = new Date();
    if (password.status === 1 || now > password.expiresAt) {
      // 如果是时间过期但状态未更新，更新状态
      if (password.status === 0) {
        await this.passwordRepo.update(password.id, { status: 1 });
      }
      throw new HttpException(
        '密码已过期，请联系客服获取新密码',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. 检查问卷是否启用
    if (!password.survey || password.survey.status !== 1) {
      throw new HttpException('该问卷暂时不可用', HttpStatus.BAD_REQUEST);
    }

    // 4. 不再更新 status，直接返回（可重复使用）
    return {
      passwordId: password.id,
      surveyId: password.surveyId,
      survey: {
        id: password.survey.id,
        title: password.survey.title,
        description: password.survey.description,
        introImage: password.survey.introImage,
        introText: password.survey.introText,
        totalQuestions: password.survey.totalQuestions,
      },
      expiresAt: password.expiresAt,
    };
  }

  /**
   * 批量生成密码
   */
  async generatePasswords(dto: GeneratePasswordDto) {
    // 根据surveyId或slug查询问卷
    let survey;
    if (dto.surveyId) {
      survey = await this.surveyRepo.findOne({
        where: { id: dto.surveyId },
      });
    } else if (dto.slug) {
      survey = await this.surveyRepo.findOne({
        where: { slug: dto.slug },
      });
    }

    if (!survey) {
      throw new HttpException(
        '问卷不存在',
        HttpStatus.NOT_FOUND,
      );
    }

    const validityHours = this.configService.get('PASSWORD_VALIDITY_HOURS') || 12;
    const passwords: AccessPassword[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

    // 生成指定数量的密码
    for (let i = 0; i < dto.count; i++) {
      const password = this.generateRandomPassword();
      passwords.push(
        this.passwordRepo.create({
          surveyId: dto.surveyId,
          password,
          status: 0,
          generatedAt: now,
          expiresAt,
        }),
      );
    }

    // 批量保存
    await this.passwordRepo.save(passwords);

    return {
      count: passwords.length,
      validityHours,
      expiresAt,
      passwords: passwords.map((p) => ({
        id: p.id,
        password: p.password,
        expiresAt: p.expiresAt,
      })),
    };
  }

  /**
   * 获取密码列表
   */
  async getPasswordList(surveyId?: number, status?: number, page = 1, limit = 50) {
    const where: any = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.passwordRepo.findAndCount({
      where,
      relations: ['survey'],
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list: list.map((p) => ({
        id: p.id,
        password: p.password,
        status: p.status,
        statusText: this.getStatusText(p.status, p.expiresAt),
        surveyId: p.surveyId,
        surveyTitle: p.survey?.title,
        generatedAt: p.generatedAt,
        expiresAt: p.expiresAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 批量删除密码
   */
  async deletePasswords(ids: number[]) {
    const result = await this.passwordRepo.delete({
      id: In(ids),
    });
    return {
      deletedCount: result.affected || 0,
    };
  }

  /**
   * 生成随机密码（8位字母数字组合）
   */
  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字符
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * 获取状态文本
   * 新状态设计：0=可使用, 1=已过期
   * 同时检查时间是否已过期
   */
  private getStatusText(status: number, expiresAt?: Date): string {
    // 如果 status=1 或者时间已过期，都显示为已过期
    if (status === 1) {
      return '已过期';
    }
    if (expiresAt && new Date() > expiresAt) {
      return '已过期';
    }
    return '可使用';
  }
}
