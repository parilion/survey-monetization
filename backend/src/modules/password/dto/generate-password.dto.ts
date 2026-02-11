import { IsInt, IsOptional, Min, Max, IsString, ValidateIf } from 'class-validator';

export class GeneratePasswordDto {
  @ValidateIf((o) => !o.slug)
  @IsInt({ message: '问卷ID必须是整数' })
  @IsOptional()
  surveyId?: number;

  @ValidateIf((o) => !o.surveyId)
  @IsString({ message: 'slug必须是字符串' })
  @IsOptional()
  slug?: string;

  @IsInt({ message: '生成数量必须是整数' })
  @Min(1, { message: '至少生成1个密码' })
  @Max(1000, { message: '最多生成1000个密码' })
  count: number;
}
