import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { Survey } from '../../entities/survey.entity';
import { SurveyScoreConfig } from '../../entities/survey-score-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey, SurveyScoreConfig])],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule {}
