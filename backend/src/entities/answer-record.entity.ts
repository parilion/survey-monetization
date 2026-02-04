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

  @Column({ type: 'int', unsigned: true })
  passwordId: number;

  @Column({ type: 'int', unsigned: true })
  surveyId: number;

  @Column({ type: 'json', comment: '答题记录JSON' })
  answers: any;

  @Column({ type: 'varchar', length: 50, nullable: true })
  resultType: string;

  @Column({ type: 'int', nullable: true })
  resultScore: number;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  userIp: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => AccessPassword, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'password_id' })
  password: AccessPassword;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
