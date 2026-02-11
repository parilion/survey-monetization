import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Question } from './question.entity';
import { OptionScoreDetail } from './option-score-detail.entity';

@Entity('options')
export class Option {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'question_id', type: 'int', unsigned: true })
  questionId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({
    name: 'score_type',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '计分类型(用于结果计算)',
  })
  scoreType: string;

  @Column({
    name: 'score_value',
    type: 'int',
    default: 1,
    comment: '计分分值（加权计分用）',
  })
  scoreValue: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Question, (question) => question.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @OneToMany(() => OptionScoreDetail, (detail) => detail.option)
  scoreDetails: OptionScoreDetail[];
}
