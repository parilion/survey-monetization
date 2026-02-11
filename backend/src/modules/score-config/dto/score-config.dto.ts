import { IsOptional, IsString, IsNumber, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 范围配置 DTO（累加制用）
 */
export class RangeDto {
  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;

  @IsString()
  result: string;

  @IsString()
  label: string;
}

/**
 * 创建问卷计分配置 DTO（简化版）
 */
export class CreateScoreConfigDto {
  @IsNumber()
  surveyId: number;

  @IsString()
  @IsOptional()
  @IsIn(['vote', 'score'])
  scoreMode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RangeDto)
  @IsOptional()
  ranges?: RangeDto[];

  @IsString()
  @IsOptional()
  @IsIn(['first', 'random', 'all'])
  tieBreaker?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 更新问卷计分配置 DTO（简化版）
 */
export class UpdateScoreConfigDto {
  @IsString()
  @IsOptional()
  @IsIn(['vote', 'score'])
  scoreMode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RangeDto)
  @IsOptional()
  ranges?: RangeDto[];

  @IsString()
  @IsOptional()
  @IsIn(['first', 'random', 'all'])
  tieBreaker?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
