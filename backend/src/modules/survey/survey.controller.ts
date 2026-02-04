import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  /**
   * 创建问卷
   * POST /api/survey
   */
  @Post()
  async create(@Body() dto: CreateSurveyDto) {
    const result = await this.surveyService.create(dto);
    return {
      code: 200,
      message: '创建成功',
      data: result,
    };
  }

  /**
   * 获取问卷列表
   * GET /api/survey
   */
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: number,
  ) {
    const result = await this.surveyService.findAll(+page, +limit, status);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 获取问卷详情
   * GET /api/survey/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.surveyService.findOne(+id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 获取问卷详情（包含题目）
   * GET /api/survey/:id/with-questions
   */
  @Get(':id/with-questions')
  async findOneWithQuestions(@Param('id') id: number) {
    const result = await this.surveyService.findOneWithQuestions(+id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 更新问卷
   * PUT /api/survey/:id
   */
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateSurveyDto) {
    const result = await this.surveyService.update(+id, dto);
    return {
      code: 200,
      message: '更新成功',
      data: result,
    };
  }

  /**
   * 删除问卷
   * DELETE /api/survey/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.surveyService.remove(+id);
    return {
      code: 200,
      message: '删除成功',
      data: result,
    };
  }
}
