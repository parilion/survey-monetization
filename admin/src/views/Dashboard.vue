<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总问卷数" :value="statistics.totalSurveys">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="总测试次数" :value="statistics.totalTests">
            <template #prefix>
              <el-icon><Tickets /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已生成密码" :value="statistics.totalPasswords">
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="今日测试" :value="statistics.todayTests">
            <template #prefix>
              <el-icon><DataAnalysis /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>快速操作</span>
          </template>
          <el-space wrap>
            <el-button type="primary" @click="$router.push('/survey')">
              <el-icon><Document /></el-icon>
              创建问卷
            </el-button>
            <el-button type="success" @click="$router.push('/password')">
              <el-icon><Key /></el-icon>
              生成密码
            </el-button>
            <el-button type="info" @click="$router.push('/answer')">
              <el-icon><Tickets /></el-icon>
              查看记录
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
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
.dashboard {
  /* 样式 */
}
</style>
