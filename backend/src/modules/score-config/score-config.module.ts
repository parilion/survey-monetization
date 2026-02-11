import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreConfigController } from './score-config.controller';
import { ScoreConfigService } from './score-config.service';
import { SurveyScoreConfig } from '../../entities/survey-score-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyScoreConfig])],
  controllers: [ScoreConfigController],
  providers: [ScoreConfigService],
  exports: [ScoreConfigService],
})
export class ScoreConfigModule {}
