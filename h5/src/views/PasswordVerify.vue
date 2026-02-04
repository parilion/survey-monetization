<template>
  <div class="password-verify">
    <div class="container">
      <div class="icon">
        <van-icon name="lock" size="60" color="#1989fa" />
      </div>

      <h1 class="title">密码保护</h1>

      <p class="desc">
        "{{ pageTitle }}" 该页面受密码保护，请输入访问密码
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
        访问页面
      </van-button>

      <div class="footer-links">
        <a href="javascript:;" class="link">返回首页</a>
        <span class="divider">|</span>
        <a href="javascript:;" class="link">English</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { verifyPassword } from '@/api'

const router = useRouter()
const surveyStore = useSurveyStore()

const password = ref('')
const loading = ref(false)
const pageTitle = ref('你的性格底色是什么味道？')

onMounted(() => {
  // 检查是否有保存的数据
  const restored = surveyStore.restoreFromStorage()
  if (restored && surveyStore.passwordId) {
    // 如果有保存的数据，直接跳转到对应页面
    if (surveyStore.result) {
      router.push('/result')
    } else if (surveyStore.answers.length > 0) {
      router.push('/question')
    } else {
      router.push('/intro')
    }
  }
})

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

      // 跳转到引导页
      setTimeout(() => {
        router.push('/intro')
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 500px;
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

.footer-links {
  text-align: center;
  font-size: 14px;
}

.link {
  color: #1989fa;
  text-decoration: none;
}

.link:active {
  opacity: 0.7;
}

.divider {
  margin: 0 10px;
  color: #ccc;
}
</style>
