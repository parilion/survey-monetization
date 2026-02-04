import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { AccessPassword } from '../../entities/access-password.entity';
import { ResultTemplate } from '../../entities/result-template.entity';
import { Option } from '../../entities/option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnswerRecord,
      AccessPassword,
      ResultTemplate,
      Option,
    ]),
  ],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService],
})
export class AnswerModule {}
