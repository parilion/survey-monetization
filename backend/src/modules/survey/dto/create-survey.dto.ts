import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSurveyDto {
  @IsNotEmpty({ message: '问卷标题不能为空' })
  @IsString({ message: '问卷标题必须是字符串' })
  title: string;

  @IsOptional()
  @IsString({ message: '问卷描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '引导页图片必须是字符串' })
  introImage?: string;

  @IsOptional()
  @IsString({ message: '引导页文案必须是字符串' })
  introText?: string;

  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态值必须大于等于0' })
  status?: number;
}
