<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth">
      <div class="sidebar">
        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="logo-icon">
            <el-icon :size="20"><DataAnalysis /></el-icon>
          </div>
          <span class="logo-text">问卷管理</span>
        </div>

        <!-- 菜单 -->
        <el-menu
          :default-active="currentRoute"
          router
          class="sidebar-menu"
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
        </el-menu>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶栏 -->
      <el-header class="main-header">
        <div class="header-left">
          <h2 class="page-title">{{ currentTitle }}</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-info">
              <div class="user-avatar">
                {{ (userStore.nickname || userStore.username || 'A').charAt(0).toUpperCase() }}
              </div>
              <span class="user-name">{{ userStore.nickname || userStore.username }}</span>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
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

const sidebarWidth = `${240}px`
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

/* ---- 侧边栏 ---- */
.el-aside {
  background-color: #fff;
  border-right: 1px solid var(--color-border-light);
  overflow: hidden;
}

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 1px solid var(--color-border-light);
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-title);
}

/* ---- 菜单 ---- */
.sidebar-menu {
  flex: 1;
  padding: 8px 12px;
  background: transparent !important;
}

.sidebar-menu .el-menu-item {
  height: 40px;
  line-height: 40px;
  border-radius: var(--radius-md);
  margin-bottom: 2px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.sidebar-menu .el-menu-item:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

/* ---- 顶栏 ---- */
.main-header {
  height: var(--header-height) !important;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px !important;
}

.header-left .page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-title);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.user-info:hover {
  background: var(--color-bg-hover);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  color: var(--color-text-primary);
}

/* ---- 内容区 ---- */
.main-content {
  background-color: var(--color-bg-page);
  padding: var(--spacing-lg) !important;
}
</style>
