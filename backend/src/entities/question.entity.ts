import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { Option } from './option.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  surveyId: number;

  @Column({ type: 'text' })
  title: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'single',
    comment: '题目类型: single=单选, multiple=多选',
  })
  questionType: string;

  @Column({ type: 'int', default: 0, comment: '排序顺序' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否必答: 0=否, 1=是' })
  isRequired: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @OneToMany(() => Option, (option) => option.question)
  options: Option[];
}
