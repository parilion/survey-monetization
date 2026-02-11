import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccessPassword } from './access-password.entity';
import { Survey } from './survey.entity';

@Entity('answer_records')
export class AnswerRecord {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'password_id', type: 'int', unsigned: true })
  passwordId: number;

  @Column({ name: 'survey_id', type: 'int', unsigned: true })
  surveyId: number;

  @Column({ type: 'json', comment: '答题记录JSON' })
  answers: any;

  @Column({ name: 'result_type', type: 'varchar', length: 50, nullable: true })
  resultType: string;

  @Column({ name: 'result_score', type: 'int', nullable: true })
  resultScore: number;

  @Column({ name: 'dimension_scores', type: 'json', nullable: true, comment: '维度得分详情' })
  dimensionScores: Record<string, number>;

  @Column({ name: 'metric_scores', type: 'json', nullable: true, comment: 'KPI指标得分详情' })
  metricScores: Record<string, number>;

  @Column({ name: 'match_score', type: 'int', nullable: true, comment: '匹配度分数' })
  matchScore: number;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ name: 'user_ip', type: 'varchar', length: 50, nullable: true })
  userIp: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => AccessPassword, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'password_id' })
  password: AccessPassword;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
