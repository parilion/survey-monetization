import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { AccessPassword } from '../../entities/access-password.entity';
import { ResultTemplate } from '../../entities/result-template.entity';
import { Option } from '../../entities/option.entity';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ResultCalculator } from '../../common/utils/result-calculator';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(AnswerRecord)
    private readonly answerRepo: Repository<AnswerRecord>,
    @InjectRepository(AccessPassword)
    private readonly passwordRepo: Repository<AccessPassword>,
    @InjectRepository(ResultTemplate)
    private readonly resultTemplateRepo: Repository<ResultTemplate>,
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
  ) {}

  /**
   * 提交答题结果
   */
  async submit(dto: SubmitAnswerDto, userIp: string, userAgent: string) {
    // 1. 验证密码是否有效
    const password = await this.passwordRepo.findOne({
      where: { id: dto.passwordId },
    });

    if (!password || password.status !== 1) {
      throw new HttpException(
        '密码无效或未激活',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 检查是否已经提交过答案
    const existingRecord = await this.answerRepo.findOne({
      where: { passwordId: dto.passwordId },
    });

    if (existingRecord && existingRecord.completedAt) {
      throw new HttpException(
        '您已经完成过此测试，请勿重复提交',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. 获取所有选项信息（用于计算结果）
    const optionIds = dto.answers.map((a) => a.optionId);
    const options = await this.optionRepo.find({
      where: optionIds.map((id) => ({ id })),
    });

    // 4. 计算结果
    const calculation = ResultCalculator.calculate(dto.answers, options);

    // 5. 获取结果模板
    const resultTemplate = await this.resultTemplateRepo.findOne({
      where: {
        surveyId: dto.surveyId,
        resultType: calculation.resultType,
      },
    });

    if (!resultTemplate) {
      throw new HttpException(
        '结果模板不存在，请联系管理员',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 6. 保存或更新答题记录
    let answerRecord: AnswerRecord;

    if (existingRecord) {
      // 更新已有记录
      existingRecord.answers = dto.answers;
      existingRecord.resultType = calculation.resultType;
      existingRecord.resultScore = calculation.totalScore;
      existingRecord.completedAt = new Date();
      existingRecord.userIp = userIp;
      existingRecord.userAgent = userAgent;
      answerRecord = await this.answerRepo.save(existingRecord);
    } else {
      // 创建新记录
      answerRecord = this.answerRepo.create({
        passwordId: dto.passwordId,
        surveyId: dto.surveyId,
        answers: dto.answers,
        resultType: calculation.resultType,
        resultScore: calculation.totalScore,
        completedAt: new Date(),
        userIp,
        userAgent,
      });
      answerRecord = await this.answerRepo.save(answerRecord);
    }

    // 7. 返回结果
    return {
      recordId: answerRecord.id,
      resultType: calculation.resultType,
      resultScore: calculation.totalScore,
      scores: calculation.scores,
      result: {
        id: resultTemplate.id,
        title: resultTemplate.title,
        description: resultTemplate.description,
        imageUrl: resultTemplate.imageUrl,
        detailContent: resultTemplate.detailContent,
      },
    };
  }

  /**
   * 获取答题结果
   */
  async getResult(passwordId: number) {
    // 1. 查询答题记录
    const answerRecord = await this.answerRepo.findOne({
      where: { passwordId },
    });

    if (!answerRecord) {
      throw new HttpException(
        '未找到答题记录',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!answerRecord.completedAt) {
      throw new HttpException(
        '测试尚未完成',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. 获取结果模板
    const resultTemplate = await this.resultTemplateRepo.findOne({
      where: {
        surveyId: answerRecord.surveyId,
        resultType: answerRecord.resultType,
      },
    });

    if (!resultTemplate) {
      throw new HttpException(
        '结果模板不存在',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 3. 返回结果
    return {
      recordId: answerRecord.id,
      resultType: answerRecord.resultType,
      resultScore: answerRecord.resultScore,
      completedAt: answerRecord.completedAt,
      result: {
        id: resultTemplate.id,
        title: resultTemplate.title,
        description: resultTemplate.description,
        imageUrl: resultTemplate.imageUrl,
        detailContent: resultTemplate.detailContent,
      },
    };
  }

  /**
   * 获取答题记录列表（管理后台）
   */
  async findAll(surveyId?: number, page = 1, limit = 50) {
    const where: any = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }

    const [list, total] = await this.answerRepo.findAndCount({
      where,
      relations: ['password', 'survey'],
      order: { completedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      list: list.map((record) => ({
        id: record.id,
        passwordId: record.passwordId,
        password: record.password?.password,
        surveyId: record.surveyId,
        surveyTitle: record.survey?.title,
        resultType: record.resultType,
        resultScore: record.resultScore,
        completedAt: record.completedAt,
        userIp: record.userIp,
        createdAt: record.createdAt,
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
   * 获取答题详情（管理后台）
   */
  async findOne(id: number) {
    const record = await this.answerRepo.findOne({
      where: { id },
      relations: ['password', 'survey'],
    });

    if (!record) {
      throw new HttpException(
        '答题记录不存在',
        HttpStatus.NOT_FOUND,
      );
    }

    return record;
  }
}
