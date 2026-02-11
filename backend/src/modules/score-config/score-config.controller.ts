import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ScoreConfigService } from './score-config.service';
import { CreateScoreConfigDto, UpdateScoreConfigDto } from './dto/score-config.dto';

@Controller('score-config')
export class ScoreConfigController {
  constructor(private readonly scoreConfigService: ScoreConfigService) {}

  /**
   * 创建计分配置
   */
  @Post()
  create(@Body() dto: CreateScoreConfigDto) {
    return this.scoreConfigService.createOrUpdate(dto);
  }

  /**
   * 获取或创建计分配置（必须放在 :surveyId 之前）
   */
  @Get(':surveyId/or-create')
  findOrCreate(@Param('surveyId') surveyId: string) {
    return this.scoreConfigService.findOrCreate(+surveyId);
  }

  /**
   * 获取计分配置（必须放在 :surveyId/or-create 之后）
   */
  @Get(':surveyId')
  findOne(@Param('surveyId') surveyId: string) {
    return this.scoreConfigService.findOne(+surveyId);
  }

  /**
   * 更新计分配置
   */
  @Put(':surveyId')
  update(@Param('surveyId') surveyId: string, @Body() dto: UpdateScoreConfigDto) {
    return this.scoreConfigService.update(+surveyId, dto);
  }

  /**
   * 删除计分配置
   */
  @Delete(':surveyId')
  remove(@Param('surveyId') surveyId: string) {
    return this.scoreConfigService.remove(+surveyId);
  }
}
