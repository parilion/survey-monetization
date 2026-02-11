<template>
  <div class="question-page">
    <!-- 顶部区域 -->
    <div class="hero-section">
      <p class="hero-label">{{ surveyStore.surveyTitle }}</p>
      <div class="progress-info">
        <span class="progress-text">Question {{ currentIndex + 1 }}/{{ totalQuestions }}</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 答题卡片 -->
    <div class="card-section">
      <div class="question-card">
        <div class="card-ornament">&#10047;</div>

        <!-- 题目 -->
        <h2 class="question-title">{{ currentQuestion?.title }}</h2>

        <!-- 选项列表 -->
        <div class="options-list">
          <div
            v-for="option in currentQuestion?.options"
            :key="option.id"
            class="option-item"
            :class="{ selected: selectedOptionId === option.id }"
            @click="handleSelectOption(option.id)"
          >
            <span class="option-text">{{ option.content }}</span>
            <span v-if="selectedOptionId === option.id" class="option-check">&#10003;</span>
          </div>
        </div>

        <!-- 上一题/下一题按钮 -->
        <div class="nav-buttons">
          <button
            class="nav-btn prev-btn"
            :disabled="currentIndex === 0"
            @click="handlePrev"
          >
            &lsaquo; 上一题
          </button>
          <button
            class="nav-btn next-btn"
            :disabled="currentIndex >= totalQuestions - 1"
            @click="handleNext"
          >
            下一题 &rsaquo;
          </button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer-section">
      <p class="footer-name">{{ surveyStore.surveyTitle }}</p>
      <p class="footer-disclaimer">本测试仅供娱乐参考，不构成专业建议</p>
      <div class="footer-ornaments">
        <span>&#127793;</span>
        <span>&#127807;</span>
        <span>&#127811;</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { submitAnswer } from '@/api'

const route = useRoute()
const router = useRouter()
const surveyStore = useSurveyStore()

// 获取当前slug
const slug = computed(() => route.params.slug)

const selectedOptionId = ref(null)

const currentIndex = computed(() => surveyStore.currentIndex)
const currentQuestion = computed(() => surveyStore.currentQuestion)
const totalQuestions = computed(() => surveyStore.totalQuestions)
const progressPercentage = computed(() => {
  return Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100)
})

// 监听当前题目变化，恢复已保存的答案
watch(
  currentQuestion,
  (question) => {
    if (question) {
      // 查找该题的答案
      const answer = surveyStore.answers.find(
        (a) => a.questionId === question.id
      )
      selectedOptionId.value = answer ? answer.optionId : null
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 检查是否有问卷数据
  if (!surveyStore.surveyId || surveyStore.questions.length === 0) {
    showToast('请先验证密码')
    router.push(`/${slug.value}`)
  }
})

const handleSelectOption = (optionId) => {
  selectedOptionId.value = optionId

  // 保存答案
  surveyStore.saveAnswer(currentQuestion.value.id, optionId)

  // 自动跳转到下一题
  setTimeout(() => {
    handleNext()
  }, 300)
}

const handleNext = async () => {
  // 检查是否已完成所有题目
  if (currentIndex.value >= totalQuestions.value - 1) {
    // 检查是否所有题目都已回答
    if (surveyStore.answers.length < totalQuestions.value) {
      showToast('请完成所有题目')
      return
    }

    // 提交答案
    await handleSubmit()
  } else {
    surveyStore.nextQuestion()
  }
}

const handlePrev = () => {
  if (currentIndex.value > 0) {
    surveyStore.prevQuestion()
  } else {
    showToast('已经是第一题了')
  }
}

const handleSubmit = async () => {
  const toast = showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const submitData = {
      passwordId: surveyStore.passwordId,
      surveyId: surveyStore.surveyId,
      answers: surveyStore.answers
    }

    const res = await submitAnswer(submitData)

    if (res.code === 200 && res.data) {
      // 保存结果
      surveyStore.setResult(res.data)

      showToast({
        message: '提交成功',
        type: 'success'
      })

      // 跳转到结果页，保持在当前slug路径下
      setTimeout(() => {
        router.push(`/${slug.value}/result`)
      }, 500)
    }
  } catch (error) {
    console.error('提交失败:', error)
    showToast('提交失败，请重试')
  } finally {
    toast.close()
  }
}
</script>

<style scoped>
.question-page {
  min-height: 100vh;
  background-color: #f5f0eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Noto Sans SC', sans-serif;
}

/* ===== Hero 区域 ===== */
.hero-section {
  width: 100%;
  padding: 50px 30px 28px;
  text-align: center;
}

.hero-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 14px;
  color: #b8a692;
  letter-spacing: 2px;
  margin: 0 0 20px;
}

.progress-info {
  margin-bottom: 12px;
}

.progress-text {
  font-family: 'Playfair Display', serif;
  font-size: 13px;
  color: #b8a692;
  letter-spacing: 1px;
}

.progress-bar-wrap {
  max-width: 200px;
  margin: 0 auto;
}

.progress-bar-track {
  height: 4px;
  background-color: #e8e0d6;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9bba9, #b8865a);
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* ===== 卡片区域 ===== */
.card-section {
  width: 100%;
  padding: 0 24px 20px;
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.question-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 28px;
  width: 100%;
  box-shadow: 0 2px 20px rgba(90, 74, 58, 0.06);
  text-align: center;
}

.card-ornament {
  font-size: 16px;
  color: #c9bba9;
  margin-bottom: 20px;
}

.question-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  font-weight: 600;
  color: #3a2e22;
  text-align: center;
  margin: 0 0 28px;
  line-height: 1.6;
  letter-spacing: 1px;
}

/* ===== 选项列表 ===== */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  border: 1.5px solid #e8e0d6;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #faf7f4;
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  border-color: #b8865a;
  background: rgba(184, 134, 90, 0.08);
}

.option-text {
  font-size: 15px;
  color: #5a4a3a;
  flex: 1;
  text-align: left;
}

.option-check {
  font-size: 16px;
  color: #b8865a;
  font-weight: 600;
}

/* ===== 导航按钮 ===== */
.nav-buttons {
  display: flex;
  gap: 16px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #ebe5de;
}

.nav-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  font-family: 'Noto Sans SC', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 1px;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.prev-btn {
  background: #ffffff;
  border: 1px solid #d8cfc4;
  color: #b8a692;
}

.prev-btn:active:not(:disabled) {
  background: #faf7f4;
}

.next-btn {
  background: #f0e8df;
  border: none;
  color: #5a4a3a;
  font-weight: 500;
}

.next-btn:active:not(:disabled) {
  background: #e8ddd2;
}

/* ===== 页脚 ===== */
.footer-section {
  margin-top: auto;
  padding: 30px 20px 40px;
  text-align: center;
}

.footer-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 12px;
  color: #c9bba9;
  letter-spacing: 2px;
  margin: 0 0 6px;
}

.footer-disclaimer {
  font-size: 11px;
  color: #d4c8b8;
  margin: 0 0 16px;
}

.footer-ornaments {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #d4c8b8;
}
</style>
