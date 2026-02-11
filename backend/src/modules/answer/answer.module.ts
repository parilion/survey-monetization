import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { AccessPassword } from '../../entities/access-password.entity';
import { ResultTemplate } from '../../entities/result-template.entity';
import { Option } from '../../entities/option.entity';
import { SurveyScoreConfig } from '../../entities/survey-score-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessPassword,
      ResultTemplate,
      Option,
      SurveyScoreConfig,
    ]),
  ],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService],
})
export class AnswerModule {}
