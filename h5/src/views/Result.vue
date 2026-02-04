<template>
  <div class="result-page">
    <!-- 顶部标题栏 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="handleBack" />
      <span class="header-title">{{ surveyStore.surveyTitle }}</span>
      <van-icon name="ellipsis" size="20" />
    </div>

    <!-- 结果卡片 -->
    <div class="container">
      <div class="result-card">
        <div class="result-header">
          <p class="label">你的性格底色是</p>
          <h1 class="result-type">
            {{ result?.result?.title || '加载中...' }}
          </h1>
          <p class="result-type-en">({{ result?.resultType || '' }})</p>
        </div>

        <!-- 标签 -->
        <div class="tags" v-if="result?.result?.description">
          <span
            v-for="(tag, index) in descriptionTags"
            :key="index"
            class="tag"
          >
            #{{ tag }}
          </span>
        </div>

        <!-- 详细描述 -->
        <div class="description">
          <p>{{ result?.result?.detailContent || result?.result?.description }}</p>
        </div>

        <!-- 推荐香调 -->
        <div class="recommendation" v-if="showRecommendation">
          <div class="rec-box">
            <div class="rec-icon">◇</div>
            <div class="rec-title">推荐香调构成</div>
            <div class="rec-icon">◇</div>
          </div>
          <div class="rec-content">
            佛手柑、柠檬、葡萄柚、橙花、马鞭草
          </div>
        </div>

        <!-- 重新测试按钮 -->
        <van-button
          type="primary"
          block
          round
          class="retry-btn"
          @click="handleRetry"
        >
          重新测试
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { getAnswerResult } from '@/api'

const router = useRouter()
const surveyStore = useSurveyStore()

const result = computed(() => surveyStore.result)

// 从描述中提取标签（简单处理）
const descriptionTags = computed(() => {
  const desc = result.value?.result?.description || ''
  // 这里可以根据实际情况解析标签
  // 暂时返回默认标签
  return ['元气', '少年感', '直率', '乐观']
})

const showRecommendation = computed(() => {
  // 可以根据resultType显示不同的推荐
  return true
})

onMounted(async () => {
  // 如果没有结果数据，尝试从服务器获取
  if (!result.value && surveyStore.passwordId) {
    await loadResult()
  }

  // 如果还是没有结果，返回首页
  if (!result.value) {
    showToast('请先完成测试')
    router.push('/')
  }
})

const loadResult = async () => {
  try {
    const res = await getAnswerResult(surveyStore.passwordId)
    if (res.code === 200 && res.data) {
      surveyStore.setResult(res.data)
    }
  } catch (error) {
    console.error('加载结果失败:', error)
  }
}

const handleBack = () => {
  router.push('/intro')
}

const handleRetry = async () => {
  const confirmed = await showConfirmDialog({
    title: '提示',
    message: '确定要重新测试吗？当前结果将被清空。'
  }).catch(() => false)

  if (confirmed) {
    // 重置测试
    surveyStore.resetTest()
    router.push('/question')
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.header-title {
  font-size: 14px;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header .van-icon {
  cursor: pointer;
}

.container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.result-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.result-header {
  text-align: center;
  margin-bottom: 25px;
}

.label {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.result-type {
  font-size: 32px;
  font-weight: 700;
  color: #b8a08e;
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.result-type-en {
  font-size: 20px;
  color: #999;
  font-weight: 300;
}

.tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.tag {
  background: #f5f5f5;
  color: #666;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
}

.description {
  margin-bottom: 25px;
}

.description p {
  font-size: 15px;
  line-height: 1.9;
  color: #666;
  text-align: justify;
}

.recommendation {
  border: 1px dashed #ddd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  background: #fafafa;
}

.rec-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.rec-icon {
  font-size: 16px;
  color: #999;
}

.rec-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.rec-content {
  text-align: center;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.retry-btn {
  font-size: 16px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}
</style>
