import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '../../entities/survey.entity';
import { SurveyScoreConfig, ScoreMode } from '../../entities/survey-score-config.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
    @InjectRepository(SurveyScoreConfig)
    private readonly scoreConfigRepo: Repository<SurveyScoreConfig>,
  ) {}

  /**
   * 生成随机slug
   */
  private generateSlug(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  }

  /**
   * 检查slug是否已存在
   */
  private async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
    const query = this.surveyRepo.createQueryBuilder('survey')
      .where('survey.slug = :slug', { slug });

    if (excludeId) {
      query.andWhere('survey.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * 获取唯一的slug
   */
  private async getUniqueSlug(baseSlug?: string): Promise<string> {
    const slug = baseSlug || this.generateSlug();

    if (await this.checkSlugExists(slug)) {
      // 如果已存在，尝试添加随机后缀
      return this.getUniqueSlug(`${slug}${Math.floor(Math.random() * 10)}`);
    }

    return slug;
  }

  /**
   * 创建问卷
   */
  async create(dto: CreateSurveyDto) {
    // 生成或校验slug
    const slug = dto.slug
      ? (await this.checkSlugExists(dto.slug) ? await this.getUniqueSlug() : dto.slug)
      : await this.getUniqueSlug();

    const survey = this.surveyRepo.create({ ...dto, slug });
    await this.surveyRepo.save(survey);

    // 创建默认的计分配置（只有填写了计分模式才创建）
    if (dto.scoreMode && dto.scoreMode !== '') {
      const scoreConfig = this.scoreConfigRepo.create({
        surveyId: survey.id,
        scoreMode: dto.scoreMode as ScoreMode,
        tieBreaker: dto.tieBreaker || 'first',
      });
      await this.scoreConfigRepo.save(scoreConfig);
    }

    return survey;
  }

  /**
   * 获取问卷列表
   */
  async findAll(page = 1, limit = 20, status?: number) {
    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.surveyRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取问卷详情
   */
  async findOne(id: number) {
    const survey = await this.surveyRepo.findOne({
      where: { id },
    });

    if (!survey) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }

    return survey;
  }

  /**
   * 根据slug获取问卷
   */
  async findBySlug(slug: string) {
    const survey = await this.surveyRepo.findOne({
      where: { slug },
    });

    if (!survey) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }

    return survey;
  }

  /**
   * 根据slug获取问卷（包含题目和选项）
   */
  async findBySlugWithQuestions(slug: string) {
    const survey = await this.surveyRepo.findOne({
      where: { slug },
      relations: ['questions', 'questions.options'],
    });

    if (!survey) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }

    // 按排序顺序排列题目和选项
    survey.questions.sort((a, b) => a.sortOrder - b.sortOrder);
    survey.questions.forEach((q) => {
      q.options.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return survey;
  }

  /**
   * 获取问卷详情（包含题目和选项）
   */
  async findOneWithQuestions(id: number) {
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
    });

    if (!survey) {
      throw new HttpException('问卷不存在', HttpStatus.NOT_FOUND);
    }

    // 按排序顺序排列题目和选项
    survey.questions.sort((a, b) => a.sortOrder - b.sortOrder);
    survey.questions.forEach((q) => {
      q.options.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return survey;
  }

  /**
   * 更新问卷
   */
  async update(id: number, dto: UpdateSurveyDto) {
    const survey = await this.findOne(id);

    // 如果传入了slug且与当前不同，检查唯一性
    if (dto.slug && dto.slug !== survey.slug) {
      if (await this.checkSlugExists(dto.slug, id)) {
        throw new HttpException('该slug已被使用', HttpStatus.BAD_REQUEST);
      }
    }

    Object.assign(survey, dto);
    await this.surveyRepo.save(survey);
    return survey;
  }

  /**
   * 删除问卷
   */
  async remove(id: number) {
    const survey = await this.findOne(id);
    await this.surveyRepo.remove(survey);
    return { message: '删除成功' };
  }

  /**
   * 更新问卷题目总数
   */
  async updateTotalQuestions(surveyId: number, count: number) {
    await this.surveyRepo.update(surveyId, {
      totalQuestions: count,
    });
  }
}
