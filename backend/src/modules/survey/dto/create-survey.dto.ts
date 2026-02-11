import { IsNotEmpty, IsString, IsOptional, IsInt, Min, IsIn, MaxLength, Matches } from 'class-validator';

// 计分模式枚举
export const SCORE_MODES = ['vote', 'score'];

// 平局处理方式枚举
export const TIE_BREAKERS = ['first', 'random', 'all'];

export class CreateSurveyDto {
  @IsOptional()
  @IsString({ message: 'slug必须是字符串' })
  @MaxLength(50, { message: 'slug最大长度为50个字符' })
  @Matches(/^[a-z0-9]+$/, { message: 'slug只能包含小写字母和数字' })
  slug?: string;

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
  @IsString({ message: '介绍页大标题必须是字符串' })
  @MaxLength(200, { message: '介绍页大标题最大长度为200个字符' })
  introTitle?: string;

  @IsOptional()
  @IsString({ message: '介绍页副标题必须是字符串' })
  @MaxLength(200, { message: '介绍页副标题最大长度为200个字符' })
  introSubtitle?: string;

  @IsOptional()
  @IsString({ message: '介绍页按钮文字必须是字符串' })
  @MaxLength(50, { message: '介绍页按钮文字最大长度为50个字符' })
  introButtonText?: string;

  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @Min(0, { message: '状态值必须大于等于0' })
  status?: number;

  @IsOptional()
  @IsString({ message: '计分模式必须是字符串' })
  @IsIn(SCORE_MODES, { message: '计分模式无效' })
  scoreMode?: string;

  @IsOptional()
  @IsString({ message: '平局处理方式必须是字符串' })
  @IsIn(TIE_BREAKERS, { message: '平局处理方式无效' })
  tieBreaker?: string;
}
