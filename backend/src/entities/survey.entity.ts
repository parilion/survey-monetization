import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Question } from './question.entity';
import { ResultTemplate } from './result-template.entity';
import { AccessPassword } from './access-password.entity';

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, comment: '问卷短码，用于URL' })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'intro_image', type: 'varchar', length: 500, nullable: true })
  introImage: string;

  @Column({ name: 'intro_text', type: 'text', nullable: true })
  introText: string;

  @Column({ name: 'intro_title', type: 'varchar', length: 200, nullable: true, comment: '介绍页大标题' })
  introTitle: string;

  @Column({ name: 'intro_subtitle', type: 'varchar', length: 200, nullable: true, comment: '介绍页副标题' })
  introSubtitle: string;

  @Column({ name: 'intro_button_text', type: 'varchar', length: 50, nullable: true, comment: '介绍页按钮文字' })
  introButtonText: string;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态: 0=禁用, 1=启用' })
  status: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.survey)
  questions: Question[];

  @OneToMany(() => ResultTemplate, (template) => template.survey)
  resultTemplates: ResultTemplate[];

  @OneToMany(() => AccessPassword, (password) => password.survey)
  passwords: AccessPassword[];
}
