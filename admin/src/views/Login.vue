<template>
  <div class="login-container">
    <!-- 左侧品牌区 -->
    <div class="login-brand">
      <div class="brand-content">
        <h1 class="brand-title">问卷管理系统</h1>
        <p class="brand-subtitle">高效管理问卷测试，轻松获取用户洞察</p>

        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>灵活的问卷配置与多种计分模式</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>安全的密码验证与访问控制</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>精美的 H5 测试页面与结果展示</span>
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <p>&copy; {{ new Date().getFullYear() }} RedBook Survey System</p>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-form-wrapper">
      <div class="login-form-inner">
        <h2 class="form-title">登录</h2>
        <p class="form-subtitle">请输入您的账号信息</p>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-width="0"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              size="large"
              prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-tips">
          <p>默认账号: admin / admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true

      // 简单的登录验证（生产环境需要调用后端API）
      setTimeout(() => {
        if (
          loginForm.username === 'admin' &&
          loginForm.password === 'admin123'
        ) {
          // 保存用户信息
          userStore.setUser({
            token: 'mock_token_' + Date.now(),
            username: loginForm.username,
            nickname: '超级管理员'
          })

          ElMessage.success('登录成功')
          router.push('/')
        } else {
          ElMessage.error('用户名或密码错误')
        }

        loading.value = false
      }, 500)
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
}

/* ---- 左侧品牌区 ---- */
.login-brand {
  width: 55%;
  background: var(--color-bg-page);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px;
}

.brand-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 480px;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-title);
  margin-bottom: 12px;
}

.brand-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 48px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--color-text-primary);
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

.brand-footer {
  font-size: 13px;
  color: var(--color-text-placeholder);
}

/* ---- 右侧表单区 ---- */
.login-form-wrapper {
  width: 45%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.login-form-inner {
  width: 100%;
  max-width: 360px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-title);
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: var(--color-text-placeholder);
  margin-bottom: 32px;
}

.login-form :deep(.el-input__wrapper) {
  height: 44px;
}

.login-btn {
  width: 100%;
  height: 44px !important;
  font-size: 15px;
  font-weight: 500;
}

.login-tips {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: var(--color-text-placeholder);
}
</style>
