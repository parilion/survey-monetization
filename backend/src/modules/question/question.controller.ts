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
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { BatchCreateQuestionDto } from './dto/batch-create-question.dto';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 创建题目
   * POST /api/question
   */
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    const result = await this.questionService.create(dto);
    return {
      code: 200,
      message: '创建成功',
      data: result,
    };
  }

  /**
   * 批量创建题目
   * POST /api/question/batch
   */
  @Post('batch')
  async batchCreate(@Body() dto: BatchCreateQuestionDto) {
    const result = await this.questionService.batchCreate(
      dto.surveyId,
      dto.questions,
    );
    return {
      code: 200,
      message: '批量创建成功',
      data: result,
    };
  }

  /**
   * 获取题目列表
   * GET /api/question
   */
  @Get()
  async findAll(@Query('surveyId') surveyId?: number) {
    const result = await this.questionService.findAll(surveyId);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 获取题目详情
   * GET /api/question/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.questionService.findOne(+id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 更新题目
   * PUT /api/question/:id
   */
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateQuestionDto) {
    const result = await this.questionService.update(+id, dto);
    return {
      code: 200,
      message: '更新成功',
      data: result,
    };
  }

  /**
   * 删除题目
   * DELETE /api/question/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.questionService.remove(+id);
    return {
      code: 200,
      message: '删除成功',
      data: result,
    };
  }

  /**
   * 批量删除题目
   * DELETE /api/question/batch
   */
  @Delete('batch')
  async batchRemove(@Body('ids') ids: number[]) {
    const result = await this.questionService.batchRemove(ids);
    return {
      code: 200,
      message: result.message,
      data: { deletedCount: result.deletedCount },
    };
  }
}
