import { IsNotEmpty, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerItemDto {
  @IsNotEmpty({ message: '题目ID不能为空' })
  @IsInt({ message: '题目ID必须是整数' })
  questionId: number;

  @IsNotEmpty({ message: '选项ID不能为空' })
  @IsInt({ message: '选项ID必须是整数' })
  optionId: number;
}

export class SubmitAnswerDto {
  @IsNotEmpty({ message: '密码ID不能为空' })
  @IsInt({ message: '密码ID必须是整数' })
  passwordId: number;

  @IsNotEmpty({ message: '问卷ID不能为空' })
  @IsInt({ message: '问卷ID必须是整数' })
  surveyId: number;

  @IsNotEmpty({ message: '答题记录不能为空' })
  @IsArray({ message: '答题记录必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
