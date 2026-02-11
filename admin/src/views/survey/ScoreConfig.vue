<template>
  <div class="score-config">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="page-title-left">
        <el-button @click="goBack" text>
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <span class="header-divider"></span>
        <h3 class="page-title">计分配置</h3>
        <el-tag v-if="surveyTitle" type="info" size="small">{{ surveyTitle }}</el-tag>
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="config-card">
      <el-form :model="config" label-width="120px">
        <!-- 计分模式选择 -->
        <el-form-item label="计分模式">
          <el-radio-group v-model="config.scoreMode" @change="handleModeChange">
            <el-radio value="vote">
              投票制
              <el-tooltip content="统计各结果类型的选择次数，得票最高者为结果" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-radio>
            <el-radio value="score">
              累加制
              <el-tooltip content="选项有分值，累加后按分数区间匹配结果" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
          <div class="form-tip">
            <el-tag v-if="config.scoreMode === 'vote'" type="success" size="small">
              适用于性格测试、MBTI、偏好测试
            </el-tag>
            <el-tag v-else-if="config.scoreMode === 'score'" type="warning" size="small">
              适用于 NPS、满意度调查
            </el-tag>
          </div>
        </el-form-item>

        <!-- 累加制配置 -->
        <template v-if="config.scoreMode === 'score'">
          <el-divider content-position="left">分数区间配置</el-divider>

          <div class="config-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>每道题的分值在「题目管理」中设置，最高分为 {{ maxScore }} 分（题目数 × 每题最高分）</span>
          </div>

          <div class="config-rows">
            <div v-for="(range, index) in config.ranges" :key="index" class="config-row">
              <el-input-number v-model="range.min" :min="0" placeholder="最小值" controls-position="right" />
              <span class="separator">~</span>
              <el-input-number v-model="range.max" :min="0" placeholder="最大值" controls-position="right" />
              <span class="separator">分 →</span>
              <el-input v-model="range.result" placeholder="结果类型" style="width: 120px" />
              <el-input v-model="range.label" placeholder="结果标签" style="width: 120px" />
              <el-button type="danger" link @click="removeRange(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>

            <button type="button" class="add-row-btn" @click="addRange">
              <el-icon><Plus /></el-icon>
              添加区间
            </button>
          </div>
        </template>

        <!-- 平局处理 -->
        <el-divider v-if="config.scoreMode === 'vote'" />
        <el-form-item v-if="config.scoreMode === 'vote'" label="平局处理">
          <el-radio-group v-model="config.tieBreaker">
            <el-radio value="first">取第一个</el-radio>
            <el-radio value="random">随机选择</el-radio>
            <el-radio value="all">返回全部</el-radio>
          </el-radio-group>
          <div class="form-tip">当多个结果类型票数相同时的处理方式</div>
        </el-form-item>

        <!-- 备注 -->
        <el-divider />
        <el-form-item label="备注">
          <el-input v-model="config.remark" type="textarea" :rows="2" placeholder="备注说明" />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getScoreConfigOrCreate,
  updateScoreConfig,
  createScoreConfig
} from '@/api'

const route = useRoute()
const router = useRouter()

const surveyId = ref(route.query.surveyId)
const surveyTitle = ref(route.query.title || '')
const saving = ref(false)
const hasExistingConfig = ref(false)
const totalQuestions = ref(10) // 假设每题最高10分

// 计算最高分
const maxScore = computed(() => totalQuestions.value * 10)

const config = ref({
  surveyId: null,
  scoreMode: 'vote',
  ranges: [],
  tieBreaker: 'first',
  remark: ''
})

onMounted(async () => {
  if (surveyId.value) {
    config.value.surveyId = Number(surveyId.value)
    await loadConfig()
  }
})

const loadConfig = async () => {
  try {
    const res = await getScoreConfigOrCreate(surveyId.value)
    if (res) {
      hasExistingConfig.value = !res.isNew
      config.value = {
        surveyId: res.surveyId,
        scoreMode: res.scoreMode || 'vote',
        ranges: res.ranges || [],
        tieBreaker: res.tieBreaker || 'first',
        remark: res.remark || ''
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const handleModeChange = (value) => {
  if (value === 'score' && config.value.ranges.length === 0) {
    // 初始化默认区间
    config.value.ranges = [
      { min: 0, max: 30, result: 'low', label: '待改进' },
      { min: 31, max: 60, result: 'medium', label: '良好' },
      { min: 61, max: 100, result: 'high', label: '优秀' }
    ]
  }
}

const addRange = () => {
  const lastMax = config.value.ranges.length > 0
    ? config.value.ranges[config.value.ranges.length - 1].max
    : 0
  config.value.ranges.push({
    min: lastMax + 1,
    max: lastMax + 30,
    result: '',
    label: ''
  })
}

const removeRange = (index) => {
  config.value.ranges.splice(index, 1)
}

const handleSave = async () => {
  if (!config.value.surveyId) {
    ElMessage.warning('缺少问卷ID')
    return
  }

  saving.value = true
  try {
    if (hasExistingConfig.value) {
      await updateScoreConfig(surveyId.value, config.value)
      ElMessage.success('配置已更新')
    } else {
      await createScoreConfig(config.value)
      ElMessage.success('配置已创建')
      hasExistingConfig.value = true
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/survey')
}
</script>

<style scoped>
.config-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 32px;
  max-width: 800px;
}

.header-divider {
  display: inline-block;
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 4px;
}

.config-rows {
  margin-bottom: 20px;
  padding-left: 0;
}

.config-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
}

.separator {
  color: var(--color-text-placeholder);
}

.add-row-btn {
  width: 100%;
  height: 38px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all var(--transition-fast);
}

.add-row-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.config-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f0f9eb;
  border-radius: var(--radius-md);
  color: #67c23a;
  font-size: 13px;
  margin-bottom: 20px;
}
</style>
