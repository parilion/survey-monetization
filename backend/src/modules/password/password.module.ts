import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { AccessPassword } from '../../entities/access-password.entity';
import { Survey } from '../../entities/survey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessPassword, Survey])],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
