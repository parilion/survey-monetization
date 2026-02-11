import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as entities from './entities';
import { PasswordModule } from './modules/password/password.module';
import { SurveyModule } from './modules/survey/survey.module';
import { QuestionModule } from './modules/question/question.module';
import { AnswerModule } from './modules/answer/answer.module';
import { ResultModule } from './modules/result/result.module';
import { ScoreConfigModule } from './modules/score-config/score-config.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM 数据库连接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'redbook_survey'),
        entities: Object.values(entities),
        synchronize: false, // 生产环境必须设为false
        logging: configService.get('NODE_ENV') === 'development',
        timezone: '+08:00',
      }),
    }),
    // 业务模块
    PasswordModule,
    SurveyModule,
    QuestionModule,
    AnswerModule,
    ResultModule,
    ScoreConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
