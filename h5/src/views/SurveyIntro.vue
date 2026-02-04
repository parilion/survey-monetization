<template>
  <div class="survey-intro">
    <div class="container">
      <div class="content-card">
        <div class="header">
          <h1 class="main-title">寻香·性格测试</h1>
          <p class="sub-title">SCENT OF SOUL</p>
        </div>

        <div class="video-placeholder">
          <van-icon name="play-circle-o" size="60" color="#999" />
        </div>

        <div class="description">
          <p>{{ introText }}</p>
        </div>

        <van-button
          type="primary"
          block
          round
          class="start-btn"
          @click="handleStart"
        >
          开始寻香之旅
        </van-button>
      </div>
    </div>

    <div class="bottom-nav">
      <van-icon name="arrow-left" size="24" />
      <van-icon name="search" size="24" />
      <van-icon name="bars" size="24" class="active" />
      <van-badge :content="totalQuestions" max="99">
        <van-icon name="bookmark-o" size="24" />
      </van-badge>
      <van-icon name="wap-home-o" size="24" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { getSurveyWithQuestions } from '@/api'

const router = useRouter()
const surveyStore = useSurveyStore()

const introText = computed(() => {
  return (
    surveyStore.introText ||
    '香水是灵魂的隐形外衣。通过 30 道深度心理潜意识测试，寻找那款真正属于你灵魂底色的本命香氛。'
  )
})

const totalQuestions = computed(() => surveyStore.totalQuestions || 30)

onMounted(async () => {
  // 如果没有问卷ID，返回密码验证页
  if (!surveyStore.surveyId) {
    showToast('请先验证密码')
    router.push('/')
    return
  }

  // 加载问卷题目
  if (surveyStore.questions.length === 0) {
    await loadQuestions()
  }
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

      // 保存题目列表
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

  // 跳转到答题页
  router.push('/question')
}
</script>

<style scoped>
.survey-intro {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
}

.container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.content-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.header {
  margin-bottom: 30px;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.sub-title {
  font-size: 14px;
  color: #999;
  letter-spacing: 3px;
  font-weight: 300;
}

.video-placeholder {
  width: 100%;
  height: 180px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
}

.description {
  margin-bottom: 30px;
}

.description p {
  font-size: 15px;
  line-height: 1.8;
  color: #666;
}

.start-btn {
  font-size: 16px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
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
