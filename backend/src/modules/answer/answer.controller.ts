import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  /**
   * 提交答题结果（H5用户端）
   * POST /api/answer/submit
   * 不存储答题记录，只计算并返回结果
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Body() dto: SubmitAnswerDto) {
    const result = await this.answerService.submit(dto);

    return {
      code: 200,
      message: '提交成功',
      data: result,
    };
  }
}
