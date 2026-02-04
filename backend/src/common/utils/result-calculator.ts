/**
 * 结果计算器
 * 简单计分制：根据用户选择的选项的 score_type 进行累计，得分最高的类型为最终结果
 */

interface AnswerItem {
  questionId: number;
  optionId: number;
}

interface OptionInfo {
  id: number;
  scoreType: string;
}

export class ResultCalculator {
  /**
   * 计算测试结果
   * @param answers 用户答题记录
   * @param options 所有选项信息
   * @returns 计算结果 { resultType: string, totalScore: number, scores: object }
   */
  static calculate(answers: AnswerItem[], options: OptionInfo[]) {
    const scores: Record<string, number> = {};

    // 遍历用户答案
    answers.forEach((answer) => {
      const option = options.find((o) => o.id === answer.optionId);
      if (option && option.scoreType) {
        // 对应类型 +1 分
        scores[option.scoreType] = (scores[option.scoreType] || 0) + 1;
      }
    });

    // 如果没有任何计分，返回默认类型
    if (Object.keys(scores).length === 0) {
      return {
        resultType: 'default',
        totalScore: 0,
        scores: {},
      };
    }

    // 找出得分最高的类型
    const resultType = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b,
    );

    return {
      resultType,
      totalScore: scores[resultType],
      scores,
    };
  }

  /**
   * 计算完成率
   * @param answeredCount 已答题数
   * @param totalCount 总题数
   * @returns 完成率（百分比）
   */
  static calculateCompletionRate(
    answeredCount: number,
    totalCount: number,
  ): number {
    if (totalCount === 0) return 0;
    return Math.round((answeredCount / totalCount) * 100);
  }
}
