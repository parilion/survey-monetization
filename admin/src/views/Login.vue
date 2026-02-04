<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>小红书问卷管理系统</h2>
          <p>RedBook Survey Management System</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
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
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="tips">
        <p>默认账号: admin</p>
        <p>默认密码: admin123</p>
      </div>
    </el-card>
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
}

.card-header p {
  font-size: 14px;
  color: #999;
}

.tips {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #999;
  line-height: 1.8;
}
</style>
