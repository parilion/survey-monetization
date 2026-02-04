import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { ResultTemplate } from '../../entities/result-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResultTemplate])],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ResultService],
})
export class ResultModule {}
