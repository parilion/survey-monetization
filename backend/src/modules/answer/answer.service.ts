import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AccessPassword } from '../../entities/access-password.entity';
import { ResultTemplate } from '../../entities/result-template.entity';
import { Option } from '../../entities/option.entity';
import { SurveyScoreConfig } from '../../entities/survey-score-config.entity';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { ResultCalculator, OptionInfo, ScoreConfig } from '../../common/utils/result-calculator';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(AccessPassword)
    private readonly passwordRepo: Repository<AccessPassword>,
    @InjectRepository(ResultTemplate)
    private readonly resultTemplateRepo: Repository<ResultTemplate>,
    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
    @InjectRepository(SurveyScoreConfig)
    private readonly scoreConfigRepo: Repository<SurveyScoreConfig>,
  ) {}

  /**
   * 提交答题结果
   * 不存储答题记录，只计算并返回结果
   */
  async submit(dto: SubmitAnswerDto) {
    try {
      // 1. 验证密码是否有效
      const password = await this.passwordRepo.findOne({
        where: { id: dto.passwordId },
      });

      if (!password) {
        throw new HttpException('密码无效', HttpStatus.BAD_REQUEST);
      }

      // 检查密码是否已过期（status=1 或 时间过期）
      const now = new Date();
      if (password.status === 1 || now > password.expiresAt) {
        // 如果是时间过期但状态未更新，更新状态
        if (password.status === 0) {
          await this.passwordRepo.update(password.id, { status: 1 });
        }
        throw new HttpException('密码已过期', HttpStatus.BAD_REQUEST);
      }

      // 2. 获取所有选项信息（用于计算结果）
      const optionIds = dto.answers.map((a) => a.optionId);
      const options = await this.optionRepo.find({
        where: { id: In(optionIds) },
        relations: ['scoreDetails'],
      });

      // 3. 获取问卷计分配置
      const scoreConfig = await this.scoreConfigRepo.findOne({
        where: { surveyId: dto.surveyId },
      });

      // 4. 构建完整选项信息
      const optionInfos = await this.buildOptionInfos(options);

      // 5. 构建计分配置
      const scoringConfig: ScoreConfig = scoreConfig
        ? {
            scoreMode: scoreConfig.scoreMode as 'vote' | 'score',
            ranges: scoreConfig.ranges,
            tieBreaker: scoreConfig.tieBreaker as 'first' | 'random' | 'all',
          }
        : { scoreMode: 'vote' };

      // 6. 计算结果
      const calculation = ResultCalculator.calculate(
        dto.answers,
        optionInfos,
        scoringConfig,
      );
      console.log('Calculation result:', calculation.resultType, calculation.totalScore);

      // 7. 获取结果模板
      const resultTemplate = await this.resultTemplateRepo.findOne({
        where: {
          surveyId: dto.surveyId,
          resultType: calculation.resultType,
        },
      });

      // 如果没有找到结果模板，返回默认结果
      let resultData;
      if (!resultTemplate) {
        // 尝试查找任意一个结果模板作为备用
        const fallbackTemplate = await this.resultTemplateRepo.findOne({
          where: { surveyId: dto.surveyId },
        });

        if (fallbackTemplate) {
          resultData = {
            id: fallbackTemplate.id,
            title: fallbackTemplate.title,
            description: fallbackTemplate.description,
            imageUrl: fallbackTemplate.imageUrl,
            detailContent: fallbackTemplate.detailContent,
            tags: fallbackTemplate.tags,
            recommendation: fallbackTemplate.recommendation,
          };
        } else {
          // 返回默认结果
          resultData = {
            id: 0,
            title: `${calculation.resultType}型`,
            description: '您的性格特质分析结果',
            imageUrl: null,
            detailContent: `根据您的回答，您展现了典型的${calculation.resultType}型性格特质。总得分为${calculation.totalScore}分。`,
            tags: [],
            recommendation: null,
          };
        }
      } else {
        resultData = {
          id: resultTemplate.id,
          title: resultTemplate.title,
          description: resultTemplate.description,
          imageUrl: resultTemplate.imageUrl,
          detailContent: resultTemplate.detailContent,
          tags: resultTemplate.tags,
          recommendation: resultTemplate.recommendation,
          recommendationUrl: resultTemplate.recommendationUrl,
        };
      }

      // 8. 直接返回结果，不存入数据库
      return {
        resultType: calculation.resultType,
        resultTypeLabel: calculation.resultTypeLabel,
        resultScore: calculation.totalScore,
        scores: calculation.scores,
        details: calculation.details,
        result: resultData,
      };
    } catch (error) {
      console.error('Submit error:', error);
      throw error;
    }
  }

  /**
   * 构建完整选项信息（包含扩展计分详情）
   */
  private async buildOptionInfos(options: Option[]): Promise<OptionInfo[]> {
    return options.map((option) => ({
      id: option.id,
      questionId: option.questionId,
      content: option.content,
      scoreType: option.scoreType,
      scoreValue: option.scoreValue,
    }));
  }

}
