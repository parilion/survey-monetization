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
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  /**
   * 创建结果模板
   * POST /api/result
   */
  @Post()
  async create(@Body() dto: CreateResultDto) {
    const result = await this.resultService.create(dto);
    return {
      code: 200,
      message: '创建成功',
      data: result,
    };
  }

  /**
   * 获取结果模板列表
   * GET /api/result
   */
  @Get()
  async findAll(@Query('surveyId') surveyId?: number) {
    const result = await this.resultService.findAll(surveyId);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 获取结果模板详情
   * GET /api/result/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.resultService.findOne(+id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 更新结果模板
   * PUT /api/result/:id
   */
  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateResultDto) {
    const result = await this.resultService.update(+id, dto);
    return {
      code: 200,
      message: '更新成功',
      data: result,
    };
  }

  /**
   * 删除结果模板
   * DELETE /api/result/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: number) {
    const result = await this.resultService.remove(+id);
    return {
      code: 200,
      message: '删除成功',
      data: result,
    };
  }
}
