import { defineStore } from 'pinia'

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    // 密码信息
    passwordId: null,
    password: '',
    expiresAt: null,

    // 问卷信息
    surveyId: null,
    surveyTitle: '',
    surveyDescription: '',
    introImage: '',
    introText: '',
    introTitle: '',
    introSubtitle: '',
    introButtonText: '',
    totalQuestions: 0,

    // 题目列表
    questions: [],

    // 当前答题进度
    currentIndex: 0,

    // 用户答案 [{questionId, optionId}]
    answers: [],

    // 测试结果
    result: null
  }),

  getters: {
    // 当前题目
    currentQuestion: (state) => {
      return state.questions[state.currentIndex] || null
    },

    // 答题进度百分比
    progress: (state) => {
      if (state.totalQuestions === 0) return 0
      return Math.round((state.currentIndex / state.totalQuestions) * 100)
    },

    // 是否已完成
    isCompleted: (state) => {
      return state.currentIndex >= state.totalQuestions
    }
  },

  actions: {
    // 设置密码信息
    setPasswordInfo(data) {
      this.passwordId = data.passwordId
      this.password = data.password || ''
      this.expiresAt = data.expiresAt
      this.surveyId = data.surveyId

      if (data.survey) {
        this.surveyTitle = data.survey.title
        this.surveyDescription = data.survey.description
        this.introImage = data.survey.introImage
        this.introText = data.survey.introText
        this.introTitle = data.survey.introTitle || ''
        this.introSubtitle = data.survey.introSubtitle || ''
        this.introButtonText = data.survey.introButtonText || ''
        this.totalQuestions = data.survey.totalQuestions
      }
    },

    // 设置题目列表
    setQuestions(questions) {
      this.questions = questions
      this.totalQuestions = questions.length
    },

    // 保存答案
    saveAnswer(questionId, optionId) {
      // 检查是否已经回答过这道题
      const existingIndex = this.answers.findIndex(
        (a) => a.questionId === questionId
      )

      if (existingIndex >= 0) {
        // 更新答案
        this.answers[existingIndex].optionId = optionId
      } else {
        // 添加新答案
        this.answers.push({ questionId, optionId })
      }
    },

    // 下一题
    nextQuestion() {
      if (this.currentIndex < this.totalQuestions - 1) {
        this.currentIndex++
      }
    },

    // 上一题
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    // 跳转到指定题目
    goToQuestion(index) {
      if (index >= 0 && index < this.totalQuestions) {
        this.currentIndex = index
      }
    },

    // 设置结果
    setResult(result) {
      this.result = result
    },

    // 重置测试
    resetTest() {
      this.currentIndex = 0
      this.answers = []
      this.result = null
    },

    // 完全重置（清空所有数据）
    clearAll() {
      this.$reset()
    }
  }
})
