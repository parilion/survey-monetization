import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { PasswordService } from './password.service';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';

@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  /**
   * 验证密码（H5用户端调用）
   * POST /api/password/verify
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPassword(@Body() dto: VerifyPasswordDto, @Req() req: Request) {
    const userIp = req.ip || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.passwordService.verifyPassword(
      dto,
      userIp as string,
      userAgent as string,
    );

    return {
      code: 200,
      message: '验证成功',
      data: result,
    };
  }

  /**
   * 批量生成密码（管理后台调用）
   * POST /api/password/generate
   */
  @Post('generate')
  async generatePasswords(@Body() dto: GeneratePasswordDto) {
    const result = await this.passwordService.generatePasswords(dto);
    return {
      code: 200,
      message: '生成成功',
      data: result,
    };
  }

  /**
   * 获取密码列表（管理后台调用）
   * GET /api/password/list
   */
  @Get('list')
  async getPasswordList(
    @Query('surveyId') surveyId?: number,
    @Query('status') status?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const result = await this.passwordService.getPasswordList(
      surveyId,
      status,
      +page,
      +limit,
    );
    return {
      code: 200,
      message: '获取成功',
      data: result,
    };
  }

  /**
   * 批量删除密码（管理后台调用）
   * DELETE /api/password/batch
   */
  @Delete('batch')
  async deletePasswords(@Body('ids') ids: number[]) {
    const result = await this.passwordService.deletePasswords(ids);
    return {
      code: 200,
      message: '删除成功',
      data: result,
    };
  }
}
