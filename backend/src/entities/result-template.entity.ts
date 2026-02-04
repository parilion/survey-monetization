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

@Entity('result_templates')
export class ResultTemplate {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  surveyId: number;

  @Column({ type: 'varchar', length: 50 })
  resultType: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'longtext', nullable: true })
  detailContent: string;

  @Column({ type: 'int', default: 0 })
  minScore: number;

  @Column({ type: 'int', default: 100 })
  maxScore: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.resultTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
