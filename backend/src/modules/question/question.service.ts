import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { Option } from '../../entities/option.entity';
import { SurveyService } from '../survey/survey.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
    private readonly surveyService: SurveyService,
  ) {}

  /**
   * 创建题目（包含选项）
   */
  async create(dto: CreateQuestionDto) {
    // 验证问卷是否存在
    await this.surveyService.findOne(dto.surveyId);

    // 创建题目
    const question = this.questionRepo.create({
      surveyId: dto.surveyId,
      title: dto.title,
      questionType: dto.questionType || 'single',
      sortOrder: dto.sortOrder,
      isRequired: dto.isRequired !== undefined ? dto.isRequired : 1,
    });

    const savedQuestion = await this.questionRepo.save(question);

    // 创建选项
    if (dto.options && dto.options.length > 0) {
      const options = dto.options.map((opt, index) =>
        this.optionRepo.create({
          questionId: savedQuestion.id,
          content: opt.content,
          scoreType: opt.scoreType,
          sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : index,
        }),
      );
      await this.optionRepo.save(options);
    }

    // 更新问卷题目总数
    const count = await this.questionRepo.count({
      where: { surveyId: dto.surveyId },
    });
    await this.surveyService.updateTotalQuestions(dto.surveyId, count);

    return this.findOne(savedQuestion.id);
  }

  /**
   * 批量创建题目
   */
  async batchCreate(surveyId: number, questions: CreateQuestionDto[]) {
    // 验证问卷是否存在
    await this.surveyService.findOne(surveyId);

    const createdQuestions = [];

    for (const questionDto of questions) {
      questionDto.surveyId = surveyId;
      const question = await this.create(questionDto);
      createdQuestions.push(question);
    }

    return createdQuestions;
  }

  /**
   * 获取题目列表
   */
  async findAll(surveyId?: number) {
    const where: any = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }

    const questions = await this.questionRepo.find({
      where,
      relations: ['options'],
      order: { sortOrder: 'ASC' },
    });

    // 排序选项
    questions.forEach((q) => {
      q.options.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return questions;
  }

  /**
   * 获取题目详情
   */
  async findOne(id: number) {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['options'],
    });

    if (!question) {
      throw new HttpException('题目不存在', HttpStatus.NOT_FOUND);
    }

    // 排序选项
    question.options.sort((a, b) => a.sortOrder - b.sortOrder);

    return question;
  }

  /**
   * 更新题目
   */
  async update(id: number, dto: UpdateQuestionDto) {
    const question = await this.findOne(id);

    // 更新题目基本信息
    Object.assign(question, {
      title: dto.title !== undefined ? dto.title : question.title,
      questionType:
        dto.questionType !== undefined ? dto.questionType : question.questionType,
      sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : question.sortOrder,
      isRequired:
        dto.isRequired !== undefined ? dto.isRequired : question.isRequired,
    });

    await this.questionRepo.save(question);

    // 如果有选项更新
    if (dto.options && dto.options.length > 0) {
      // 删除旧选项
      await this.optionRepo.delete({ questionId: id });

      // 创建新选项
      const options = dto.options.map((opt, index) =>
        this.optionRepo.create({
          questionId: id,
          content: opt.content,
          scoreType: opt.scoreType,
          sortOrder: opt.sortOrder !== undefined ? opt.sortOrder : index,
        }),
      );
      await this.optionRepo.save(options);
    }

    return this.findOne(id);
  }

  /**
   * 删除题目
   */
  async remove(id: number) {
    const question = await this.findOne(id);
    const surveyId = question.surveyId;

    await this.questionRepo.remove(question);

    // 更新问卷题目总数
    const count = await this.questionRepo.count({
      where: { surveyId },
    });
    await this.surveyService.updateTotalQuestions(surveyId, count);

    return { message: '删除成功' };
  }

  /**
   * 批量删除题目
   */
  async batchRemove(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new HttpException('题目ID列表不能为空', HttpStatus.BAD_REQUEST);
    }

    const questions = await this.questionRepo.find({
      where: { id: In(ids) },
    });

    if (questions.length === 0) {
      throw new HttpException('未找到要删除的题目', HttpStatus.NOT_FOUND);
    }

    const surveyId = questions[0].surveyId;
    await this.questionRepo.remove(questions);

    // 更新问卷题目总数
    const count = await this.questionRepo.count({
      where: { surveyId },
    });
    await this.surveyService.updateTotalQuestions(surveyId, count);

    return {
      message: '批量删除成功',
      deletedCount: questions.length,
    };
  }
}
