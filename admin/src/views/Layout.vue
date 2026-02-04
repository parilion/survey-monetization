<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px">
      <div class="logo">
        <h3>问卷管理</h3>
      </div>
      <el-menu
        :default-active="currentRoute"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/survey">
          <el-icon><Document /></el-icon>
          <span>问卷管理</span>
        </el-menu-item>
        <el-menu-item index="/question">
          <el-icon><EditPen /></el-icon>
          <span>题目管理</span>
        </el-menu-item>
        <el-menu-item index="/result">
          <el-icon><TrophyBase /></el-icon>
          <span>结果模板</span>
        </el-menu-item>
        <el-menu-item index="/password">
          <el-icon><Key /></el-icon>
          <span>密码管理</span>
        </el-menu-item>
        <el-menu-item index="/answer">
          <el-icon><Tickets /></el-icon>
          <span>答题记录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 头部 -->
      <el-header>
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <span class="username">{{ userStore.nickname || userStore.username }}</span>
          <el-dropdown @command="handleCommand">
            <el-icon><Avatar /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const currentRoute = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '')

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
      .then(() => {
        userStore.logout()
        router.push('/login')
      })
      .catch(() => {})
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b3a4a;
}

.logo h3 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  color: #606266;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
