import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from '../../entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
  ) {}

  /**
   * 创建问卷
   */
  async create(dto: CreateSurveyDto) {
    const survey = this.surveyRepo.create(dto);
    await this.surveyRepo.save(survey);
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
