import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultTemplate } from '../../entities/result-template.entity';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(ResultTemplate)
    private readonly resultRepo: Repository<ResultTemplate>,
  ) {}

  /**
   * 创建结果模板
   */
  async create(dto: CreateResultDto) {
    // 检查是否已存在相同类型的结果
    const existing = await this.resultRepo.findOne({
      where: {
        surveyId: dto.surveyId,
        resultType: dto.resultType,
      },
    });

    if (existing) {
      throw new HttpException(
        '该问卷已存在相同类型的结果模板',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = this.resultRepo.create(dto);
    await this.resultRepo.save(result);
    return result;
  }

  /**
   * 获取结果模板列表
   */
  async findAll(surveyId?: number) {
    const where: any = {};
    if (surveyId) {
      where.surveyId = surveyId;
    }

    const results = await this.resultRepo.find({
      where,
      relations: ['survey'],
      order: { createdAt: 'DESC' },
    });

    return results;
  }

  /**
   * 获取结果模板详情
   */
  async findOne(id: number) {
    const result = await this.resultRepo.findOne({
      where: { id },
      relations: ['survey'],
    });

    if (!result) {
      throw new HttpException('结果模板不存在', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  /**
   * 更新结果模板
   */
  async update(id: number, dto: UpdateResultDto) {
    const result = await this.findOne(id);
    Object.assign(result, dto);
    await this.resultRepo.save(result);
    return result;
  }

  /**
   * 删除结果模板
   */
  async remove(id: number) {
    const result = await this.findOne(id);
    await this.resultRepo.remove(result);
    return { message: '删除成功' };
  }
}
