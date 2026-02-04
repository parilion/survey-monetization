import { IsNotEmpty, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class BatchCreateQuestionDto {
  @IsNotEmpty({ message: '问卷ID不能为空' })
  @IsInt({ message: '问卷ID必须是整数' })
  surveyId: number;

  @IsNotEmpty({ message: '题目列表不能为空' })
  @IsArray({ message: '题目列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
