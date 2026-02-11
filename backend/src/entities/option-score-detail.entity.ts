import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Option } from './option.entity';
import { ScoreMode } from './survey-score-config.entity';

/**
 * 选项计分详情实体
 * 用于配置每个选项在不同计分模式下的得分
 */
@Entity('option_score_details')
export class OptionScoreDetail {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'option_id', type: 'int', unsigned: true })
  optionId: number;

  @Column({
    name: 'score_mode',
    type: 'enum',
    enum: ScoreMode,
    default: ScoreMode.VOTE,
    comment: '适用的计分模式',
  })
  scoreMode: ScoreMode;

  @Column({
    name: 'score_value',
    type: 'int',
    default: 1,
    comment: '基础分值',
  })
  scoreValue: number;

  @Column({
    name: 'target_types',
    type: 'json',
    nullable: true,
    comment: '目标类型列表 ["A", "B"] 用于MULTI模式',
  })
  targetTypes: string[];

  @Column({
    name: 'dimension_scores',
    type: 'json',
    nullable: true,
    comment: '维度得分 {"E": 1, "I": -1, "S": 0}',
  })
  dimensionScores: Record<string, number>;

  @Column({
    name: 'metric_scores',
    type: 'json',
    nullable: true,
    comment: 'KPI指标得分 {"efficiency": 5, "quality": 4}',
  })
  metricScores: Record<string, number>;

  @Column({
    name: 'formula_values',
    type: 'json',
    nullable: true,
    comment: '公式变量值 {"E": 1, "I": 0, "S": 1, "N": 0}',
  })
  formulaValues: Record<string, number>;

  @Column({
    name: 'mapped_type',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '映射结果类型（MAP模式）',
  })
  mappedType: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Option, (option) => option.scoreDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'option_id' })
  option: Option;
}
