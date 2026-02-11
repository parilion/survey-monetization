<template>
  <div class="survey-intro">
    <!-- Hero 区域 -->
    <div class="hero-section">
      <h1 class="hero-title">{{ displayTitle }}</h1>
      <p v-if="displaySubtitle" class="hero-subtitle">{{ displaySubtitle }}</p>
      <div class="hero-divider"></div>
      <p v-if="surveyStore.surveyDescription" class="hero-slogan">{{ surveyStore.surveyDescription }}</p>
    </div>

    <!-- 白色卡片区域 -->
    <div class="card-section">
      <div class="intro-card">
        <h2 class="card-title">{{ surveyStore.surveyTitle }}</h2>
        <div class="card-ornament">&#10047;</div>
        <div v-if="surveyStore.introText" class="card-body" v-html="formattedIntroText"></div>
        <button class="start-btn" @click="handleStart">
          <span class="btn-icon">&#127807;</span>
          {{ displayButtonText }}
        </button>
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
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { getSurveyWithQuestions } from '@/api'

const route = useRoute()
const router = useRouter()
const surveyStore = useSurveyStore()

const slug = computed(() => route.params.slug)

// 带默认值回退的显示字段
const displayTitle = computed(() => surveyStore.introTitle || surveyStore.surveyTitle || '问卷测试')
const displaySubtitle = computed(() => surveyStore.introSubtitle || '')
const displayButtonText = computed(() => surveyStore.introButtonText || '开始测试')

// 将 introText 中的 **文字** 转换为高亮 span
const formattedIntroText = computed(() => {
  const text = surveyStore.introText || ''
  return text.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
})

onMounted(async () => {
  if (!surveyStore.surveyId) {
    showToast('请先验证密码')
    router.push(`/${slug.value}`)
    return
  }

  await loadQuestions()
})

const loadQuestions = async () => {
  const toast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const res = await getSurveyWithQuestions(surveyStore.surveyId)

    if (res.code === 200 && res.data) {
      const survey = res.data

      if (survey.questions && survey.questions.length > 0) {
        surveyStore.setQuestions(survey.questions)
      } else {
        showToast('该问卷暂无题目，请联系客服')
      }
    }
  } catch (error) {
    console.error('加载题目失败:', error)
    showToast('加载题目失败，请重试')
  } finally {
    closeToast()
  }
}

const handleStart = () => {
  if (surveyStore.questions.length === 0) {
    showToast('题目加载中，请稍候')
    return
  }

  router.push(`/${slug.value}/question`)
}
</script>

<style scoped>
.survey-intro {
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
  padding: 60px 30px 36px;
  text-align: center;
}

.hero-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 42px;
  font-weight: 700;
  color: #3a2e22;
  letter-spacing: 2px;
  margin: 0 0 10px;
  line-height: 1.2;
}

.hero-subtitle {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  color: #b8a692;
  letter-spacing: 3px;
  margin: 0 0 24px;
  font-weight: 400;
}

.hero-divider {
  width: 40px;
  height: 1px;
  background-color: #c9bba9;
  margin: 0 auto 18px;
}

.hero-slogan {
  font-size: 13px;
  color: #b8a692;
  letter-spacing: 1px;
  margin: 0;
  line-height: 1.6;
}

/* ===== 卡片区域 ===== */
.card-section {
  width: 100%;
  padding: 0 24px 20px;
}

.intro-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 28px 32px;
  box-shadow: 0 2px 20px rgba(90, 74, 58, 0.06);
  text-align: center;
}

.card-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  font-weight: 600;
  color: #3a2e22;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.card-ornament {
  font-size: 16px;
  color: #c9bba9;
  margin-bottom: 20px;
}

.card-body {
  font-size: 14px;
  line-height: 2;
  color: #5a4a3a;
  text-align: center;
  margin-bottom: 28px;
  white-space: pre-line;
}

.card-body :deep(.highlight) {
  color: #b8865a;
  font-weight: 500;
}

/* ===== 开始按钮 ===== */
.start-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  max-width: 260px;
  height: 48px;
  background-color: #f0e8df;
  color: #5a4a3a;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.start-btn:active {
  transform: scale(0.97);
  background-color: #e8ddd2;
}

.btn-icon {
  font-size: 16px;
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
