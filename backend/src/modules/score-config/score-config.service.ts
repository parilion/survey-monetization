import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyScoreConfig } from '../../entities/survey-score-config.entity';
import { CreateScoreConfigDto, UpdateScoreConfigDto } from './dto/score-config.dto';

@Injectable()
export class ScoreConfigService {
  constructor(
    @InjectRepository(SurveyScoreConfig)
    private readonly scoreConfigRepo: Repository<SurveyScoreConfig>,
  ) {}

  /**
   * 创建或更新计分配置
   */
  async createOrUpdate(dto: CreateScoreConfigDto) {
    const existing = await this.scoreConfigRepo.findOne({
      where: { surveyId: dto.surveyId },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.scoreConfigRepo.save(existing);
    }

    const config = this.scoreConfigRepo.create(dto);
    return this.scoreConfigRepo.save(config);
  }

  /**
   * 获取计分配置
   */
  async findOne(surveyId: number) {
    const config = await this.scoreConfigRepo.findOne({
      where: { surveyId },
    });

    if (!config) {
      // 返回默认配置（不保存到数据库）
      return this.createDefaultConfig(surveyId);
    }

    return config;
  }

  /**
   * 获取或创建计分配置（用于编辑页面）
   */
  async findOrCreate(surveyId: number) {
    let config = await this.scoreConfigRepo.findOne({
      where: { surveyId },
    });

    const isNew = !config;
    if (!config) {
      config = this.createDefaultConfig(surveyId);
    }

    return { ...config, isNew };
  }

  /**
   * 更新计分配置
   */
  async update(surveyId: number, dto: UpdateScoreConfigDto) {
    let config = await this.scoreConfigRepo.findOne({
      where: { surveyId },
    });

    if (!config) {
      config = this.createDefaultConfig(surveyId);
    }

    Object.assign(config, dto);
    return this.scoreConfigRepo.save(config);
  }

  /**
   * 删除计分配置
   */
  async remove(surveyId: number) {
    const config = await this.scoreConfigRepo.findOne({
      where: { surveyId },
    });

    if (config) {
      await this.scoreConfigRepo.remove(config);
    }
    return { success: true };
  }

  /**
   * 创建默认配置
   */
  private createDefaultConfig(surveyId: number): SurveyScoreConfig {
    return this.scoreConfigRepo.create({
      surveyId,
      scoreMode: 'vote',  // 默认投票制
      tieBreaker: 'first',
      ranges: [],
    });
  }
}
