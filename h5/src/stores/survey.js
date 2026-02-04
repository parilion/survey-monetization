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
        this.totalQuestions = data.survey.totalQuestions
      }

      // 保存到localStorage
      this.saveToStorage()
    },

    // 设置题目列表
    setQuestions(questions) {
      this.questions = questions
      this.totalQuestions = questions.length
      this.saveToStorage()
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

      // 保存到localStorage
      this.saveToStorage()
    },

    // 下一题
    nextQuestion() {
      if (this.currentIndex < this.totalQuestions - 1) {
        this.currentIndex++
        this.saveToStorage()
      }
    },

    // 上一题
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.saveToStorage()
      }
    },

    // 跳转到指定题目
    goToQuestion(index) {
      if (index >= 0 && index < this.totalQuestions) {
        this.currentIndex = index
        this.saveToStorage()
      }
    },

    // 设置结果
    setResult(result) {
      this.result = result
      this.saveToStorage()
    },

    // 重置测试
    resetTest() {
      this.currentIndex = 0
      this.answers = []
      this.result = null
      this.saveToStorage()
    },

    // 完全重置（清空所有数据）
    clearAll() {
      this.$reset()
      localStorage.removeItem('survey_data')
    },

    // 保存到localStorage
    saveToStorage() {
      const data = {
        passwordId: this.passwordId,
        password: this.password,
        expiresAt: this.expiresAt,
        surveyId: this.surveyId,
        surveyTitle: this.surveyTitle,
        surveyDescription: this.surveyDescription,
        introImage: this.introImage,
        introText: this.introText,
        totalQuestions: this.totalQuestions,
        questions: this.questions,
        currentIndex: this.currentIndex,
        answers: this.answers,
        result: this.result
      }
      localStorage.setItem('survey_data', JSON.stringify(data))
    },

    // 从localStorage恢复
    restoreFromStorage() {
      const saved = localStorage.getItem('survey_data')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          Object.assign(this.$state, data)
          return true
        } catch (e) {
          console.error('恢复数据失败:', e)
          return false
        }
      }
      return false
    }
  }
})
