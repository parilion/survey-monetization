/**
 * 简化版计分计算器
 * 只支持两种计分模式：
 * 1. 投票制（VOTE）- 统计各结果类型的选择次数
 * 2. 累加制（SCORE）- 选项有分值，累加后按区间匹配
 */

import { ScoreMode } from '../../entities/survey-score-config.entity';

// 答题记录接口
export interface AnswerItem {
  questionId: number;
  optionId: number;
}

// 选项信息接口
export interface OptionInfo {
  id: number;
  questionId: number;
  content: string;
  scoreType: string;    // 结果类型标识
  scoreValue: number;   // 分值（累加制用）
}

// 问卷计分配置（简化版）
export interface ScoreConfig {
  scoreMode: 'vote' | 'score';  // vote=投票制, score=累加制
  tieBreaker?: 'first' | 'random' | 'all';  // 平局处理
  ranges?: RangeConfig[];  // 分数区间（累加制用）
}

// 分数区间配置
export interface RangeConfig {
  min?: number;
  max?: number;
  result: string;   // 结果类型
  label: string;    // 结果标签
}

// 计算结果接口
export interface CalculationResult {
  resultType: string;        // 结果类型标识
  resultTypeLabel?: string;   // 结果类型标签
  totalScore: number;         // 总分（累加制）
  scores: Record<string, number>;  // 各类型票数或得分
  details?: Record<string, any>;
}

export class ResultCalculator {

  /**
   * 主计算入口
   */
  static calculate(
    answers: AnswerItem[],
    options: OptionInfo[],
    config: ScoreConfig,
  ): CalculationResult {
    // 默认使用投票制
    const mode = config.scoreMode || 'vote';

    switch (mode) {
      case 'score':
        return this.scoreCalculate(answers, options, config);
      case 'vote':
      default:
        return this.voteCalculate(answers, options, config);
    }
  }

  /**
   * 投票制 - 统计各结果类型的选择次数
   * 适用场景：性格测试、MBTI、偏好测试
   *
   * 配置示例：
   * - 结果模板：Citrus, Rose, Lavender, Woody
   * - 选项A → Citrus，选项B → Rose
   *
   * 计算逻辑：
   * 统计各类型票数 → 最高票者获胜
   */
  static voteCalculate(
    answers: AnswerItem[],
    options: OptionInfo[],
    config: ScoreConfig,
  ): CalculationResult {
    const scores: Record<string, number> = {};

    // 统计各类型票数
    answers.forEach((answer) => {
      const option = options.find((o) => o.id === answer.optionId);
      if (option && option.scoreType) {
        scores[option.scoreType] = (scores[option.scoreType] || 0) + 1;
      }
    });

    if (Object.keys(scores).length === 0) {
      return {
        resultType: 'default',
        totalScore: 0,
        scores: {},
      };
    }

    // 平局处理
    const resultType = this.resolveTie(scores, config.tieBreaker);

    return {
      resultType,
      totalScore: scores[resultType] || 0,
      scores,
    };
  }

  /**
   * 累加制 - 选项分值累加后按区间匹配
   * 适用场景：NPS、满意度、评分类问卷
   *
   * 配置示例：
   * - 分数区间：0-30=待改进，31-60=良好，61-100=优秀
   * - 选项A=10分，选项B=7分
   *
   * 计算逻辑：
   * 累加分值 → 总分对照区间 → 返回结果
   */
  static scoreCalculate(
    answers: AnswerItem[],
    options: OptionInfo[],
    config: ScoreConfig,
  ): CalculationResult {
    let totalScore = 0;

    // 累加分值
    answers.forEach((answer) => {
      const option = options.find((o) => o.id === answer.optionId);
      if (option) {
        totalScore += option.scoreValue || 0;
      }
    });

    // 根据区间配置匹配结果
    const matchedRange = this.matchRange(totalScore, config.ranges || []);

    return {
      resultType: matchedRange?.result || 'default',
      resultTypeLabel: matchedRange?.label,
      totalScore,
      scores: { total: totalScore },
      details: { matchedRange },
    };
  }

  /**
   * 平局处理
   * @param scores 各类型得分
   * @param tieBreaker 平局处理方式
   */
  private static resolveTie(
    scores: Record<string, number>,
    tieBreaker?: string,
  ): string {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const maxScore = sorted[0]?.[1] || 0;
    const topTypes = sorted.filter(([, score]) => score === maxScore);

    if (topTypes.length === 1) {
      return topTypes[0][0];
    }

    // 平局处理
    switch (tieBreaker) {
      case 'random':
        return topTypes[Math.floor(Math.random() * topTypes.length)][0];
      case 'all':
        return topTypes.map((t) => t[0]).join(',');
      case 'first':
      default:
        return topTypes[0][0];
    }
  }

  /**
   * 区间匹配
   * @param score 总分
   * @param ranges 区间配置列表
   */
  private static matchRange(
    score: number,
    ranges: RangeConfig[],
  ): RangeConfig | undefined {
    // 按 min 值降序排序，优先匹配高分范围
    const sortedRanges = [...(ranges || [])].sort((a, b) => {
      const aMin = a.min ?? -Infinity;
      const bMin = b.min ?? -Infinity;
      return bMin - aMin;
    });

    for (const range of sortedRanges) {
      if (range.min !== undefined && range.max !== undefined) {
        if (score >= range.min && score <= range.max) {
          return range;
        }
      } else if (range.min !== undefined) {
        if (score >= range.min) {
          return range;
        }
      } else if (range.max !== undefined) {
        if (score <= range.max) {
          return range;
        }
      }
    }
    return undefined;
  }

  /**
   * 计算完成率
   */
  static calculateCompletionRate(
    answeredCount: number,
    totalCount: number,
  ): number {
    if (totalCount === 0) return 0;
    return Math.round((answeredCount / totalCount) * 100);
  }
}
