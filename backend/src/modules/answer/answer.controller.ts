import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  /**
   * 提交答题结果（H5用户端）
   * POST /api/answer/submit
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Body() dto: SubmitAnswerDto, @Req() req: Request) {
    const userIp = req.ip || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.answerService.submit(
      dto,
      userIp as string,
      userAgent as string,
    );

    return {
      code: 200,
      message: '提交成功',
      data: result,
    };
  }

  /**
   * 获取答题结果（H5用户端）
   * GET /api/answer/result/:passwordId
   */
  @Get('result/:passwordId')
  async getResult(@Param('passwordId') passwordId: number) {
    const result = await this.answerService.getResult(+passwordId);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 获取答题记录列表（管理后台）
   * GET /api/answer/list
   */
  @Get('list')
  async findAll(
    @Query('surveyId') surveyId?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const result = await this.answerService.findAll(surveyId, +page, +limit);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 获取答题详情（管理后台）
   * GET /api/answer/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const result = await this.answerService.findOne(+id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }
}
