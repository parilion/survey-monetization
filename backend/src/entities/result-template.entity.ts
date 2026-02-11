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
 * 结果匹配类型枚举
 */
export enum MatchType {
  HIGHEST = 'highest',      // 最高分匹配
  RANGE = 'range',         // 范围匹配
  CUSTOM = 'custom',        // 自定义公式匹配
}

@Entity('result_templates')
export class ResultTemplate {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'survey_id', type: 'int', unsigned: true })
  surveyId: number;

  @Column({ name: 'result_type', type: 'varchar', length: 50 })
  resultType: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'detail_content', type: 'longtext', nullable: true })
  detailContent: string;

  @Column({ name: 'min_score', type: 'int', default: 0 })
  minScore: number;

  @Column({ name: 'max_score', type: 'int', default: 100 })
  maxScore: number;

  @Column({
    name: 'match_type',
    type: 'enum',
    enum: MatchType,
    default: MatchType.HIGHEST,
    comment: '匹配方式: highest=最高分, range=范围, custom=自定义公式',
  })
  matchType: MatchType;

  @Column({
    name: 'match_condition',
    type: 'json',
    nullable: true,
    comment: '匹配条件 {min:5, max:10} 或 {formula: "E+I>0"}',
  })
  matchCondition: Record<string, any>;

  @Column({
    name: 'dimension_scores',
    type: 'json',
    nullable: true,
    comment: '各维度期望得分 {E:8, I:5, S:6, N:7}（用于多维度结果匹配）',
  })
  dimensionScores: Record<string, number>;

  @Column({
    name: 'tags',
    type: 'json',
    nullable: true,
    comment: '标签列表 ["标签1", "标签2"]',
  })
  tags: string[];

  @Column({
    name: 'recommendation',
    type: 'text',
    nullable: true,
    comment: '推荐内容/建议',
  })
  recommendation: string;

  @Column({
    name: 'recommendation_url',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '推荐链接',
  })
  recommendationUrl: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.resultTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
