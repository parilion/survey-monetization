import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Survey } from './survey.entity';

/**
 * 计分模式枚举（简化版）
 */
export enum ScoreMode {
  VOTE = 'vote',       // 投票制：统计各类型选择次数
  SCORE = 'score',     // 累加制：选项分值累加后按区间匹配
}

/**
 * 范围配置接口（累加制用）
 */
export interface RangeConfig {
  min?: number;        // 最小值（含）
  max?: number;        // 最大值（含）
  result: string;     // 结果类型
  label: string;      // 结果标签
}

/**
 * 问卷计分配置实体（简化版）
 *
 * 支持两种计分模式：
 * 1. 投票制（vote）- 适用性格测试、MBTI
 * 2. 累加制（score）- 适用NPS、满意度调查
 */
@Entity('survey_score_configs')
export class SurveyScoreConfig {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'survey_id', type: 'int', unsigned: true, unique: true })
  surveyId: number;

  @Column({
    name: 'score_mode',
    type: 'varchar',
    length: 20,
    default: 'vote',
    comment: '计分模式: vote=投票制, score=累加制',
  })
  scoreMode: string;

  @Column({ type: 'json', nullable: true, comment: '分数区间配置（累加制用）' })
  ranges: RangeConfig[];

  @Column({
    name: 'tie_breaker',
    type: 'varchar',
    length: 20,
    default: 'first',
    comment: '平局处理方式：first=取第一个, random=随机, all=返回全部',
  })
  tieBreaker: string;

  @Column({ type: 'text', nullable: true, comment: '备注说明' })
  remark: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
