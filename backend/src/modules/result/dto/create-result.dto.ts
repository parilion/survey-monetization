import { IsNotEmpty, IsString, IsInt, IsOptional, IsArray, Min } from 'class-validator';

export class CreateResultDto {
  @IsNotEmpty({ message: '问卷ID不能为空' })
  @IsInt({ message: '问卷ID必须是整数' })
  surveyId: number;

  @IsNotEmpty({ message: '结果类型不能为空' })
  @IsString({ message: '结果类型必须是字符串' })
  resultType: string;

  @IsNotEmpty({ message: '结果标题不能为空' })
  @IsString({ message: '结果标题必须是字符串' })
  title: string;

  @IsOptional()
  @IsString({ message: '结果描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '图片URL必须是字符串' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: '详细内容必须是字符串' })
  detailContent?: string;

  @IsOptional()
  @IsArray({ message: '标签必须是数组' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: '推荐建议必须是字符串' })
  recommendation?: string;

  @IsOptional()
  @IsString({ message: '推荐链接必须是字符串' })
  recommendationUrl?: string;

  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序必须大于等于0' })
  sortOrder?: number;

  @IsOptional()
  @IsInt({ message: '最低分数必须是整数' })
  @Min(0, { message: '最低分数必须大于等于0' })
  minScore?: number;

  @IsOptional()
  @IsInt({ message: '最高分数必须是整数' })
  @Min(0, { message: '最高分数必须大于等于0' })
  maxScore?: number;
}
