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

@Entity('access_passwords')
export class AccessPassword {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  surveyId: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  password: string;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '状态: 0=未使用, 1=已使用, 2=已过期',
  })
  status: number;

  @Column({ type: 'datetime' })
  generatedAt: Date;

  @Column({ type: 'datetime', comment: '过期时间' })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  usedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  userIp: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.passwords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;
}
