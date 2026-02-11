<template>
  <div class="result-page">
    <!-- Hero 区域 -->
    <div class="hero-section">
      <p class="hero-label">{{ resultLabel }}</p>
      <h1 class="hero-result-title">
        {{ result?.result?.title || '加载中...' }}
      </h1>
      <p class="hero-result-type" v-if="result?.resultType">({{ result?.resultType }})</p>
      <div class="hero-divider"></div>

      <!-- 匹配度 -->
      <div class="match-score" v-if="result?.matchScore">
        <div class="match-bar-wrap">
          <div class="match-bar-track">
            <div class="match-bar-fill" :style="{ width: result.matchScore + '%' }"></div>
          </div>
          <span class="match-percent">{{ result.matchScore }}%</span>
        </div>
        <p class="match-text">匹配度</p>
      </div>
    </div>

    <!-- 标签区域 -->
    <div class="tags-section" v-if="resultTags.length > 0">
      <span v-for="(tag, index) in resultTags" :key="index" class="tag">#{{ tag }}</span>
    </div>

    <!-- 白色卡片区域 -->
    <div class="card-section">
      <div class="result-card">
        <!-- 详细描述 -->
        <div class="card-ornament">&#10047;</div>
        <div class="description" v-if="result?.result?.detailContent || result?.result?.description">
          <p>{{ result?.result?.detailContent || result?.result?.description }}</p>
        </div>

        <!-- 维度得分 -->
        <div class="dimension-scores" v-if="hasDimensionScores">
          <div class="section-header">
            <span class="section-ornament">&#9830;</span>
            <span class="section-title">各维度得分</span>
            <span class="section-ornament">&#9830;</span>
          </div>
          <div class="dimension-list">
            <div
              class="dimension-item"
              v-for="(score, key) in result?.dimensionScores"
              :key="key"
            >
              <span class="dim-key">{{ key }}</span>
              <div class="dim-bar">
                <div
                  class="dim-fill"
                  :style="{ width: getDimensionPercent(score) + '%' }"
                ></div>
              </div>
              <span class="dim-score">{{ score }}</span>
            </div>
          </div>
        </div>

        <!-- KPI 指标得分 -->
        <div class="metric-scores" v-if="hasMetricScores">
          <div class="section-header">
            <span class="section-ornament">&#9830;</span>
            <span class="section-title">指标得分</span>
            <span class="section-ornament">&#9830;</span>
          </div>
          <div class="metric-list">
            <div
              class="metric-item"
              v-for="(score, key) in result?.metricScores"
              :key="key"
            >
              <span class="metric-key">{{ formatMetricKey(key) }}</span>
              <span class="metric-value">{{ score }}分</span>
            </div>
          </div>
          <div class="total-score" v-if="result?.grade">
            <span class="total-label">综合评级</span>
            <span class="total-grade">{{ result.grade }}级</span>
            <span class="total-label">{{ result.gradeLabel }}</span>
          </div>
        </div>

        <!-- 推荐内容 -->
        <div class="recommendation" v-if="result?.result?.recommendation">
          <div class="section-header">
            <span class="section-ornament">&#9830;</span>
            <span class="section-title">建议与推荐</span>
            <span class="section-ornament">&#9830;</span>
          </div>
          <div class="rec-content">
            {{ result.result.recommendation }}
          </div>
          <a
            v-if="result?.result?.recommendationUrl"
            :href="result.result.recommendationUrl"
            target="_blank"
            class="rec-link"
          >
            点击查看详情 &rsaquo;
          </a>
        </div>

        <!-- 重新测试按钮 -->
        <button class="retry-btn" @click="handleRetry">
          <span class="btn-icon">&#127807;</span>
          重新测试
        </button>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer-section">
      <p class="footer-name">{{ surveyStore.surveyTitle }}</p>
      <p class="footer-disclaimer">本测试仅供娱乐参考，不构成专业建议</p>
      <div class="footer-ornaments">
        <span>&#127793;</span>
        <span>&#127807;</span>
        <span>&#127811;</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useSurveyStore } from '@/stores/survey'
import { getAnswerResult } from '@/api'

const router = useRouter()
const route = useRoute()
const slug = computed(() => route.params.slug)
const surveyStore = useSurveyStore()

const result = computed(() => surveyStore.result)

// 结果标签文本
const resultLabel = computed(() => {
  const surveyTitle = surveyStore.surveyTitle || ''
  if (surveyTitle.includes('性格')) return '你的性格底色是'
  if (surveyTitle.includes('香调')) return '你的性格底色是'
  if (surveyTitle.includes('MBTI')) return '你的人格类型是'
  if (surveyTitle.includes('NPS')) return '你的推荐意愿是'
  if (surveyTitle.includes('KPI')) return '你的考核结果是'
  return '你的测试结果是'
})

// 动态标签列表
const resultTags = computed(() => {
  if (result.value?.result?.tags && Array.isArray(result.value.result.tags)) {
    return result.value.result.tags
  }
  return []
})

// 是否有维度得分
const hasDimensionScores = computed(() => {
  return result.value?.dimensionScores &&
    Object.keys(result.value.dimensionScores).length > 0
})

// 是否有 KPI 指标得分
const hasMetricScores = computed(() => {
  return result.value?.metricScores &&
    Object.keys(result.value.metricScores).length > 0
})

// 获取维度得分百分比
const getDimensionPercent = (score) => {
  return Math.min(100, (score / 10) * 100)
}

// 格式化 KPI 指标 key
const formatMetricKey = (key) => {
  const labels = {
    efficiency: '效率',
    quality: '质量',
    teamwork: '协作',
    responsibility: '责任心',
    communication: '沟通能力',
    learning: '学习能力'
  }
  return labels[key] || key
}

onMounted(async () => {
  if (!result.value && surveyStore.passwordId) {
    await loadResult()
  }

  if (!result.value) {
    showToast('请先完成测试')
    router.push('/' + slug.value)
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

const handleRetry = async () => {
  const confirmed = await showConfirmDialog({
    title: '提示',
    message: '确定要重新测试吗？当前结果将被清空。'
  }).catch(() => false)

  if (confirmed) {
    surveyStore.resetTest()
    router.push(`/${slug.value}/intro`)
  }
}
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background-color: #f5f0eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Noto Sans SC', sans-serif;
}

/* ===== Hero 区域 ===== */
.hero-section {
  width: 100%;
  padding: 56px 30px 32px;
  text-align: center;
}

.hero-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 14px;
  color: #b8a692;
  letter-spacing: 2px;
  margin: 0 0 12px;
}

.hero-result-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 36px;
  font-weight: 700;
  color: #3a2e22;
  letter-spacing: 2px;
  margin: 0 0 8px;
  line-height: 1.2;
}

.hero-result-type {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  color: #b8a692;
  letter-spacing: 2px;
  margin: 0 0 20px;
  font-weight: 400;
}

.hero-divider {
  width: 40px;
  height: 1px;
  background-color: #c9bba9;
  margin: 0 auto 20px;
}

/* ===== 匹配度 ===== */
.match-score {
  max-width: 240px;
  margin: 0 auto;
}

.match-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-bar-track {
  flex: 1;
  height: 6px;
  background-color: #e8e0d6;
  border-radius: 3px;
  overflow: hidden;
}

.match-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9bba9, #b8865a);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.match-percent {
  font-size: 13px;
  color: #b8865a;
  font-weight: 500;
  min-width: 36px;
  text-align: right;
}

.match-text {
  font-size: 11px;
  color: #c9bba9;
  margin: 6px 0 0;
  text-align: center;
  letter-spacing: 2px;
}

/* ===== 标签区域 ===== */
.tags-section {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 30px 24px;
}

.tag {
  background-color: rgba(184, 134, 90, 0.1);
  color: #b8865a;
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 13px;
  border: 1px solid rgba(184, 134, 90, 0.2);
  letter-spacing: 1px;
}

/* ===== 卡片区域 ===== */
.card-section {
  width: 100%;
  padding: 0 24px 20px;
}

.result-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 2px 20px rgba(90, 74, 58, 0.06);
  text-align: center;
}

.card-ornament {
  font-size: 16px;
  color: #c9bba9;
  margin-bottom: 20px;
}

/* ===== 描述 ===== */
.description {
  margin-bottom: 28px;
}

.description p {
  font-size: 14px;
  line-height: 2;
  color: #5a4a3a;
  text-align: justify;
  white-space: pre-line;
}

/* ===== 通用 section 标题 ===== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-ornament {
  font-size: 10px;
  color: #c9bba9;
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 600;
  color: #3a2e22;
  letter-spacing: 1px;
}

/* ===== 维度得分 ===== */
.dimension-scores {
  margin-bottom: 24px;
  padding: 20px 16px;
  background: #faf7f4;
  border-radius: 12px;
}

.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dimension-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dim-key {
  width: 32px;
  font-size: 14px;
  font-weight: 600;
  color: #b8865a;
  text-align: left;
}

.dim-bar {
  flex: 1;
  height: 6px;
  background: #e8e0d6;
  border-radius: 3px;
  overflow: hidden;
}

.dim-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9bba9, #b8865a);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.dim-score {
  width: 30px;
  font-size: 13px;
  color: #5a4a3a;
  text-align: right;
}

/* ===== KPI 指标得分 ===== */
.metric-scores {
  margin-bottom: 24px;
  padding: 20px 16px;
  background: #faf7f4;
  border-radius: 12px;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
}

.metric-key {
  font-size: 14px;
  color: #5a4a3a;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #b8865a;
}

.total-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #d8cfc4;
}

.total-label {
  font-size: 14px;
  color: #5a4a3a;
}

.total-grade {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 700;
  color: #b8865a;
}

/* ===== 推荐内容 ===== */
.recommendation {
  border: 1px dashed #c9bba9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 28px;
  background: #faf7f4;
}

.rec-content {
  text-align: center;
  font-size: 14px;
  color: #5a4a3a;
  line-height: 1.8;
}

.rec-link {
  display: block;
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: #b8865a;
  text-decoration: none;
  letter-spacing: 1px;
}

/* ===== 重新测试按钮 ===== */
.retry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  max-width: 260px;
  height: 48px;
  background-color: #f0e8df;
  color: #5a4a3a;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-family: 'Noto Sans SC', sans-serif;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.retry-btn:active {
  transform: scale(0.97);
  background-color: #e8ddd2;
}

.btn-icon {
  font-size: 16px;
}

/* ===== 页脚 ===== */
.footer-section {
  margin-top: auto;
  padding: 30px 20px 40px;
  text-align: center;
}

.footer-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 12px;
  color: #c9bba9;
  letter-spacing: 2px;
  margin: 0 0 6px;
}

.footer-disclaimer {
  font-size: 11px;
  color: #d4c8b8;
  margin: 0 0 16px;
}

.footer-ornaments {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #d4c8b8;
}
</style>
