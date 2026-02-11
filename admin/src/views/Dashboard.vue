<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">总问卷数</span>
          <span class="stat-value">{{ statistics.totalSurveys }}</span>
        </div>
        <div class="stat-icon stat-icon-blue">
          <el-icon :size="22"><Document /></el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">总测试次数</span>
          <span class="stat-value">{{ statistics.totalTests }}</span>
        </div>
        <div class="stat-icon stat-icon-green">
          <el-icon :size="22"><Tickets /></el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">已生成密码</span>
          <span class="stat-value">{{ statistics.totalPasswords }}</span>
        </div>
        <div class="stat-icon stat-icon-yellow">
          <el-icon :size="22"><Key /></el-icon>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">今日测试</span>
          <span class="stat-value">{{ statistics.todayTests }}</span>
        </div>
        <div class="stat-icon stat-icon-purple">
          <el-icon :size="22"><DataAnalysis /></el-icon>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="section-card">
      <h3 class="section-title">快速操作</h3>
      <div class="quick-actions">
        <div class="action-card" @click="$router.push('/survey')">
          <div class="action-icon">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <span class="action-text">创建问卷</span>
        </div>
        <div class="action-card" @click="$router.push('/password')">
          <div class="action-icon">
            <el-icon :size="24"><Key /></el-icon>
          </div>
          <span class="action-text">生成密码</span>
        </div>
        <div class="action-card" @click="$router.push('/result')">
          <div class="action-icon">
            <el-icon :size="24"><TrophyBase /></el-icon>
          </div>
          <span class="action-text">结果模板</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statistics = ref({
  totalSurveys: 0,
  totalTests: 0,
  totalPasswords: 0,
  todayTests: 0
})

onMounted(() => {
  // 这里应该调用API获取统计数据
  // 暂时使用模拟数据
  statistics.value = {
    totalSurveys: 5,
    totalTests: 2214,
    totalPasswords: 500,
    todayTests: 28
  }
})
</script>

<style scoped>
/* ---- 统计卡片 ---- */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-title);
  line-height: 1;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-blue {
  background: #e6f4ff;
  color: #1677ff;
}

.stat-icon-green {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon-yellow {
  background: #fffbe6;
  color: #faad14;
}

.stat-icon-purple {
  background: #f0f5ff;
  color: #597ef7;
}

/* ---- 快速操作 ---- */
.section-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-title);
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 16px;
}

.action-card {
  width: 120px;
  padding: 20px 16px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all var(--transition-normal);
  color: var(--color-text-secondary);
}

.action-card:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-size: 13px;
  font-weight: 500;
}
</style>
