<template>
  <div class="question-page">
    <!-- 顶部标题栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="handleBack" />
      <div class="title-bar">
        <van-icon name="success" color="#07c160" />
        <span class="title-text">{{ surveyStore.surveyTitle }}</span>
      </div>
      <div class="header-icons">
        <van-icon name="replay" size="20" />
        <van-icon name="delete-o" size="20" />
      </div>
    </div>

    <!-- 答题卡片 -->
    <div class="container">
      <div class="question-card">
        <!-- 进度条 -->
        <div class="progress-wrapper">
          <van-progress
            :percentage="progressPercentage"
            color="linear-gradient(to right, #ff6034, #ee0a24)"
            :show-pivot="false"
            stroke-width="6"
          />
        </div>

        <!-- 题号 -->
        <div class="question-number">
          Question {{ currentIndex + 1 }}/{{ totalQuestions }}
        </div>

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
            <van-icon
              v-if="selectedOptionId === option.id"
              name="success"
              color="#1989fa"
              size="20"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <van-icon name="arrow-left" size="24" @click="handlePrev" />
      <van-icon name="search" size="24" />
      <van-icon name="bars" size="24" class="active" />
      <van-badge :content="currentIndex + 1" max="99">
        <van-icon name="bookmark-o" size="24" />
      </van-badge>
      <van-icon name="wap-home-o" size="24" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, showConfirmDialog } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { submitAnswer } from '@/api'

const router = useRouter()
const surveyStore = useSurveyStore()

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
    router.push('/')
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

const handleBack = async () => {
  const confirmed = await showConfirmDialog({
    title: '提示',
    message: '确定要退出测试吗？您的答题进度已保存。'
  }).catch(() => false)

  if (confirmed) {
    router.push('/intro')
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

      // 跳转到结果页
      setTimeout(() => {
        router.push('/result')
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
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
}

.header {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.title-bar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-text {
  font-size: 14px;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-icons {
  display: flex;
  gap: 12px;
}

.header .van-icon {
  cursor: pointer;
}

.container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.question-card {
  background: white;
  border-radius: 20px;
  padding: 30px 25px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.progress-wrapper {
  margin-bottom: 20px;
}

.question-number {
  font-size: 13px;
  color: #999;
  margin-bottom: 15px;
  text-align: center;
}

.question-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.5;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  border-color: #1989fa;
  background: #f0f8ff;
}

.option-text {
  font-size: 15px;
  color: #333;
  flex: 1;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding: 0 20px;
}

.bottom-nav .van-icon {
  color: #999;
  cursor: pointer;
}

.bottom-nav .van-icon.active {
  color: #1989fa;
}
</style>
