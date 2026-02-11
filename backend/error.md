[10:05:57] Starting compilation in watch mode...

src/modules/answer/answer.controller.ts:26:58 - error TS1272: A type referenced in a decorated signature must be imported with 'import type' or a namespace import when 'isolatedModules' and 'emitDecoratorMetadata' are enabled.

26   async submit(@Body() dto: SubmitAnswerDto, @Req() req: Request) {
                                                            ~~~~~~~

  src/modules/answer/answer.controller.ts:12:10
    12 import { Request } from 'express';
                ~~~~~~~
    'Request' was imported here.

src/modules/password/password.controller.ts:27:68 - error TS1272: A type referenced in a decorated signature must be imported with 'import type' or a namespace import when 'isolatedModules' and 'emitDecoratorMetadata' are enabled.

27   async verifyPassword(@Body() dto: VerifyPasswordDto, @Req() req: Request) {
                                                                      ~~~~~~~

  src/modules/password/password.controller.ts:12:10
    12 import { Request } from 'express';
                ~~~~~~~
    'Request' was imported here.

src/modules/question/dto/update-question.dto.ts:1:29 - error TS2307: Cannot find module '@nestjs/mapped-types' or its corresponding type declarations.

1 import { PartialType } from '@nestjs/mapped-types';
                              ~~~~~~~~~~~~~~~~~~~~~~

src/modules/question/question.service.ts:72:29 - error TS2345: Argument of type 'Question' is not assignable to parameter of type 'never'.

72       createdQuestions.push(question);
                               ~~~~~~~~

src/modules/question/question.service.ts:128:18 - error TS2339: Property 'title' does not exist on type 'UpdateQuestionDto'.

128       title: dto.title !== undefined ? dto.title : question.title,
                     ~~~~~

src/modules/question/question.service.ts:128:44 - error TS2339: Property 'title' does not exist on type 'UpdateQuestionDto'.

128       title: dto.title !== undefined ? dto.title : question.title,
                                               ~~~~~

src/modules/question/question.service.ts:130:13 - error TS2339: Property 'questionType' does not exist on type 'UpdateQuestionDto'.

130         dto.questionType !== undefined ? dto.questionType : question.questionType,
                ~~~~~~~~~~~~

src/modules/question/question.service.ts:130:46 - error TS2339: Property 'questionType' does not exist on type 'UpdateQuestionDto'.

130         dto.questionType !== undefined ? dto.questionType : question.questionType,
                                                 ~~~~~~~~~~~~

src/modules/question/question.service.ts:131:22 - error TS2339: Property 'sortOrder' does not exist on type 'UpdateQuestionDto'.

131       sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : question.sortOrder,
                         ~~~~~~~~~

src/modules/question/question.service.ts:131:52 - error TS2339: Property 'sortOrder' does not exist on type 'UpdateQuestionDto'.

131       sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : question.sortOrder,
                                                       ~~~~~~~~~

src/modules/question/question.service.ts:133:13 - error TS2339: Property 'isRequired' does not exist on type 'UpdateQuestionDto'.

133         dto.isRequired !== undefined ? dto.isRequired : question.isRequired,
                ~~~~~~~~~~

src/modules/question/question.service.ts:133:44 - error TS2339: Property 'isRequired' does not exist on type 'UpdateQuestionDto'.

133         dto.isRequired !== undefined ? dto.isRequired : question.isRequired,
                                               ~~~~~~~~~~

src/modules/question/question.service.ts:139:13 - error TS2339: Property 'options' does not exist on type 'UpdateQuestionDto'.

139     if (dto.options && dto.options.length > 0) {
                ~~~~~~~

src/modules/question/question.service.ts:139:28 - error TS2339: Property 'options' does not exist on type 'UpdateQuestionDto'.

139     if (dto.options && dto.options.length > 0) {
                               ~~~~~~~

src/modules/question/question.service.ts:144:27 - error TS2339: Property 'options' does not exist on type 'UpdateQuestionDto'.

144       const options = dto.options.map((opt, index) =>
                              ~~~~~~~

src/modules/result/dto/update-result.dto.ts:1:29 - error TS2307: Cannot find module '@nestjs/mapped-types' or its corresponding type declarations.

1 import { PartialType } from '@nestjs/mapped-types';
                              ~~~~~~~~~~~~~~~~~~~~~~

src/modules/survey/dto/update-survey.dto.ts:1:29 - error TS2307: Cannot find module '@nestjs/mapped-types' or its corresponding type declarations.

1 import { PartialType } from '@nestjs/mapped-types';
                              ~~~~~~~~~~~~~~~~~~~~~~

[10:05:59] Found 17 errors. Watching for file changes.

2.[Nest] 23284  - 2026/02/05 10:14:13   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: connect ECONNREFUSED ::1:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1615:16)
3.[10:19:13] Starting compilation in watch mode...

[10:19:15] Found 0 errors. Watching for file changes.

[Nest] 11796  - 2026/02/05 10:19:16     LOG [NestFactory] Starting Nest application...
[Nest] 11796  - 2026/02/05 10:19:16     LOG [InstanceLoader] TypeOrmModule dependencies initialized +10ms
[Nest] 11796  - 2026/02/05 10:19:16     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 11796  - 2026/02/05 10:19:16     LOG [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 11796  - 2026/02/05 10:19:16     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 11796  - 2026/02/05 10:19:16     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 11796  - 2026/02/05 10:19:16   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: connect ECONNREFUSED ::1:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1615:16)
[Nest] 11796  - 2026/02/05 10:19:19   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (2)...
Error: connect ECONNREFUSED ::1:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1615:16)
[Nest] 11796  - 2026/02/05 10:19:22   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (3)...
Error: connect ECONNREFUSED ::1:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1615:16)
[Nest] 11796  - 2026/02/05 10:19:25   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (4)...
Error: connect ECONNREFUSED ::1:3306

4.[10:22:21] Starting compilation in watch mode...

[10:22:23] Found 0 errors. Watching for file changes.

[Nest] 7912  - 2026/02/05 10:22:24     LOG [NestFactory] Starting Nest application...
[Nest] 7912  - 2026/02/05 10:22:24     LOG [InstanceLoader] TypeOrmModule dependencies initialized +10ms
[Nest] 7912  - 2026/02/05 10:22:24     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 7912  - 2026/02/05 10:22:24     LOG [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 7912  - 2026/02/05 10:22:24     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 7912  - 2026/02/05 10:22:24     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 7912  - 2026/02/05 10:22:24   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: connect ECONNREFUSED 127.0.0.1:3306
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1615:16)

    5.
    [16:27:34] Starting compilation in watch mode...

src/common/utils/result-calculator.ts:6:82 - error TS2307: Cannot find module '../entities/survey-score-config.entity' or its corresponding type declarations.

6 import { ScoreMode, DimensionConfig, RangeConfig, MetricConfig, GradeRule } from '../entities/survey-score-config.entity';
                                                                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/answer/answer.service.ts:160:7 - error TS2322: Type 'number | undefined' is not assignable to type 'number'.
  Type 'undefined' is not assignable to type 'number'.

160       existingRecord.matchScore = calculation.matchScore;
          ~~~~~~~~~~~~~~~~~~~~~~~~~

src/modules/score-config/score-config.service.ts:62:37 - error TS2769: No overload matches this call.
  Overload 1 of 3, '(entityLikeArray: DeepPartial<SurveyScoreConfig>[]): SurveyScoreConfig[]', gave the following error.
    Object literal may only specify known properties, and 'surveyId' does not exist in type 'DeepPartial<SurveyScoreConfig>[]'.
  Overload 2 of 3, '(entityLike: DeepPartial<SurveyScoreConfig>): SurveyScoreConfig', gave the following error.
    Type '"single"' is not assignable to type 'ScoreMode | undefined'.

62       config = this.scoreConfigRepo.create({
                                       ~~~~~~

  src/entities/survey-score-config.entity.ts:85:3
    85   scoreMode: ScoreMode;
         ~~~~~~~~~
    The expected type comes from property 'scoreMode' which is declared here on type 'DeepPartial<SurveyScoreConfig>'

[16:27:51] Found 3 errors. Watching for file changes.