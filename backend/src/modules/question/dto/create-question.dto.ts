import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
  @IsNotEmpty({ message: '选项内容不能为空' })
  @IsString({ message: '选项内容必须是字符串' })
  content: string;

  @IsOptional()
  @IsString({ message: '计分类型必须是字符串' })
  scoreType?: string;

  @IsOptional()
  @IsInt({ message: '排序必须是整数' })
  @Min(0, { message: '排序必须大于等于0' })
  sortOrder?: number;
}

export class CreateQuestionDto {
  @IsNotEmpty({ message: '问卷ID不能为空' })
  @IsInt({ message: '问卷ID必须是整数' })
  surveyId: number;

  @IsNotEmpty({ message: '题目标题不能为空' })
  @IsString({ message: '题目标题必须是字符串' })
  title: string;

  @IsOptional()
  @IsString({ message: '题目类型必须是字符串' })
  questionType?: string;

  @IsNotEmpty({ message: '排序不能为空' })
  @IsInt({ message: '排序必须是整数' })
  @Min(1, { message: '排序必须大于0' })
  sortOrder: number;

  @IsOptional()
  @IsInt({ message: '是否必答必须是整数' })
  isRequired?: number;

  @IsNotEmpty({ message: '选项不能为空' })
  @IsArray({ message: '选项必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}
