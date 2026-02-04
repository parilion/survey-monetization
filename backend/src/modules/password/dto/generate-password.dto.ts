import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class GeneratePasswordDto {
  @IsNotEmpty({ message: '问卷ID不能为空' })
  @IsInt({ message: '问卷ID必须是整数' })
  surveyId: number;

  @IsNotEmpty({ message: '生成数量不能为空' })
  @IsInt({ message: '生成数量必须是整数' })
  @Min(1, { message: '至少生成1个密码' })
  @Max(1000, { message: '最多生成1000个密码' })
  count: number;
}
