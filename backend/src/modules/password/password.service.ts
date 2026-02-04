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
   * 1. 查询密码（状态=未使用）
   * 2. 检查是否过期（12小时）
   * 3. 标记为已使用
   * 4. 返回密码信息
   */
  async verifyPassword(
    dto: VerifyPasswordDto,
    userIp: string,
    userAgent: string,
  ) {
    // 1. 查询密码
    const password = await this.passwordRepo.findOne({
      where: {
        password: dto.password,
        status: 0, // 未使用
      },
      relations: ['survey'],
    });

    if (!password) {
      throw new HttpException(
        '密码无效或已使用',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 检查是否过期
    const now = new Date();
    if (now > password.expiresAt) {
      // 标记为已过期
      await this.passwordRepo.update(password.id, { status: 2 });
      throw new HttpException(
        '密码已过期，请联系客服获取新密码',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. 检查问卷是否启用
    if (password.survey.status !== 1) {
      throw new HttpException(
        '该问卷暂时不可用',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 4. 标记为已使用
    await this.passwordRepo.update(password.id, {
      status: 1,
      usedAt: now,
      userIp,
      userAgent,
    });

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
    // 验证问卷是否存在
    const survey = await this.surveyRepo.findOne({
      where: { id: dto.surveyId },
    });

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
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list: list.map((p) => ({
        id: p.id,
        password: p.password,
        status: p.status,
        statusText: this.getStatusText(p.status),
        surveyId: p.surveyId,
        surveyTitle: p.survey?.title,
        generatedAt: p.generatedAt,
        expiresAt: p.expiresAt,
        usedAt: p.usedAt,
        userIp: p.userIp,
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
   */
  private getStatusText(status: number): string {
    const statusMap = {
      0: '未使用',
      1: '已使用',
      2: '已过期',
    };
    return statusMap[status] || '未知';
  }
}
