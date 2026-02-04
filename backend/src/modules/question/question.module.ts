import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { Question } from '../../entities/question.entity';
import { Option } from '../../entities/option.entity';
import { SurveyModule } from '../survey/survey.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Option]), SurveyModule],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
