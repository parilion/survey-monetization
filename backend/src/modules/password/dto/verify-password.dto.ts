import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordDto {
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  password: string;
}
