<template>
  <div class="password-verify">
    <!-- 问卷介绍区域 -->
    <div v-if="survey" class="survey-header">
      <div v-if="survey.introImage" class="header-image">
        <img :src="survey.introImage" :alt="survey.title" />
      </div>
      <div class="header-content">
        <h1 class="survey-title">{{ survey.title }}</h1>
        <p v-if="survey.description" class="survey-desc">{{ survey.description }}</p>
      </div>
    </div>

    <!-- 密码验证区域 -->
    <div class="container">
      <div class="icon">
        <van-icon name="lock" size="60" color="#1989fa" />
      </div>

      <h1 class="title">密码保护</h1>

      <p class="desc">
        请输入访问密码，开始测试
      </p>

      <van-field
        v-model="password"
        placeholder="请输入访问密码"
        class="password-input"
        maxlength="20"
        @keyup.enter="handleSubmit"
      />

      <van-button
        type="primary"
        block
        round
        class="submit-btn"
        :loading="loading"
        @click="handleSubmit"
      >
        开始测试
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { verifyPassword, getSurveyBySlug } from '@/api'

const route = useRoute()
const router = useRouter()
const surveyStore = useSurveyStore()

const password = ref('')
const loading = ref(false)
const survey = ref(null)

// 从路由获取slug
const slug = route.params.slug

onMounted(async () => {
  // 清除之前的数据，确保每次访问都是全新的状态
  surveyStore.clearAll()

  // 加载问卷信息
  if (slug) {
    await loadSurvey(slug)
  }
})

// 加载问卷信息
const loadSurvey = async (slug) => {
  const toast = showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  })

  try {
    const res = await getSurveyBySlug(slug)
    if (res.code === 200 && res.data) {
      survey.value = res.data
      // 保存问卷基本信息到store
      surveyStore.setPasswordInfo({
        passwordId: null,
        surveyId: res.data.id,
        expiresAt: null,
        survey: {
          id: res.data.id,
          title: res.data.title,
          description: res.data.description,
          introImage: res.data.introImage,
          introText: res.data.introText,
          totalQuestions: res.data.totalQuestions || res.data.questions?.length || 0
        }
      })
    }
  } catch (error) {
    console.error('加载问卷失败:', error)
    showToast('问卷不存在')
  } finally {
    closeToast()
  }
}

const handleSubmit = async () => {
  if (!password.value.trim()) {
    showToast('请输入访问密码')
    return
  }

  loading.value = true

  try {
    const res = await verifyPassword(password.value.trim())

    if (res.code === 200 && res.data) {
      // 保存密码信息到store
      surveyStore.setPasswordInfo(res.data)

      showToast({
        message: '验证成功',
        type: 'success'
      })

      // 跳转到引导页，保持在当前slug路径下
      setTimeout(() => {
        router.push(`/${slug}/intro`)
      }, 500)
    }
  } catch (error) {
    console.error('密码验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-verify {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 问卷介绍头部 */
.survey-header {
  background: white;
  padding-bottom: 20px;
}

.header-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-content {
  padding: 20px;
}

.survey-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.survey-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.container {
  background: white;
  margin: 20px;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.icon {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
  color: #333;
}

.desc {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.6;
}

.password-input {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.password-input :deep(.van-field__control) {
  font-size: 15px;
  padding: 12px 0;
}

.submit-btn {
  font-size: 16px;
  height: 48px;
  margin-bottom: 20px;
}
</style>
