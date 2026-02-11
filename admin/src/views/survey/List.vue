<template>
  <div class="survey-list">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h3 class="page-title">问卷列表</h3>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新建问卷
      </el-button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <div class="table-card-body">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="slug" label="Slug" min-width="120">
            <template #default="{ row }">
              <span v-if="row.slug" class="slug-tag">{{ row.slug }}</span>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="问卷标题" min-width="250" />
          <el-table-column prop="totalQuestions" label="题目数量" width="100" />
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" min-width="300" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <span class="action-divider"></span>
              <el-button type="primary" link @click="handleCopyLink(row)">复制链接</el-button>
              <span class="action-divider"></span>
              <el-button type="primary" link @click="handleViewQuestions(row)">题目管理</el-button>
              <span class="action-divider"></span>
              <el-button type="primary" link @click="handleScoreConfig(row)">计分配置</el-button>
              <span class="action-divider"></span>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="table-card-footer">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="640px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="form.slug" placeholder="问卷短码，用于URL" maxlength="50" />
          <div class="form-tip">用于生成问卷专属链接，仅支持小写字母和数字</div>
        </el-form-item>
        <el-form-item label="问卷标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入问卷标题" />
        </el-form-item>
        <el-form-item label="问卷描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入问卷描述"
          />
        </el-form-item>
        <el-form-item label="引导文案" prop="introText">
          <el-input
            v-model="form.introText"
            type="textarea"
            :rows="3"
            placeholder="请输入引导页文案"
          />
        </el-form-item>

        <el-divider content-position="left">介绍页配置（可选）</el-divider>

        <el-form-item label="介绍页大标题" prop="introTitle">
          <el-input v-model="form.introTitle" placeholder="如 Floral Soul（不填则使用问卷标题）" maxlength="200" />
        </el-form-item>
        <el-form-item label="介绍页副标题" prop="introSubtitle">
          <el-input v-model="form.introSubtitle" placeholder="如 본명꽃 심리테스트（不填则不显示）" maxlength="200" />
        </el-form-item>
        <el-form-item label="按钮文字" prop="introButtonText">
          <el-input v-model="form.introButtonText" placeholder='如 开始探索（不填则显示"开始测试"）' maxlength="50" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">计分配置</el-divider>

        <el-form-item label="计分模式">
          <el-radio-group v-model="form.scoreMode">
            <el-radio value="vote">投票制</el-radio>
            <el-radio value="score">累加制</el-radio>
          </el-radio-group>
          <div class="form-tip">
            <el-tag v-if="form.scoreMode === 'vote'" type="success" size="small">适用于性格测试、MBTI、偏好测试</el-tag>
            <el-tag v-else-if="form.scoreMode === 'score'" type="warning" size="small">适用于 NPS、满意度调查</el-tag>
          </div>
        </el-form-item>

        <el-form-item label="平局处理">
          <el-select v-model="form.tieBreaker">
            <el-option label="取第一个 (first)" value="first" />
            <el-option label="随机选择 (random)" value="random" />
            <el-option label="返回全部 (all)" value="all" />
          </el-select>
          <div class="form-tip">当多个结果得分相同时的处理方式</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSurveyList,
  createSurvey,
  updateSurvey,
  deleteSurvey
} from '@/api'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建问卷')
const formRef = ref()

const tableData = ref([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const form = reactive({
  id: null,
  slug: '',
  title: '',
  description: '',
  introText: '',
  introTitle: '',
  introSubtitle: '',
  introButtonText: '',
  status: 1,
  scoreMode: 'vote',
  tieBreaker: 'first'
})

const rules = {
  title: [{ required: true, message: '请输入问卷标题', trigger: 'blur' }],
  slug: [
    { pattern: /^[a-z0-9]*$/, message: 'Slug只能包含小写字母和数字', trigger: 'blur' }
  ]
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getSurveyList({
      page: pagination.page,
      limit: pagination.limit
    })
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list || []
      pagination.total = res.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新建问卷'
  Object.assign(form, {
    id: null,
    slug: '',
    title: '',
    description: '',
    introText: '',
    introTitle: '',
    introSubtitle: '',
    introButtonText: '',
    status: 1,
    scoreMode: 'vote',
    tieBreaker: 'first'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑问卷'
  Object.assign(form, {
    id: row.id,
    slug: row.slug || '',
    title: row.title,
    description: row.description,
    introText: row.introText,
    introTitle: row.introTitle || '',
    introSubtitle: row.introSubtitle || '',
    introButtonText: row.introButtonText || '',
    status: row.status,
    scoreMode: row.scoreMode || '',
    tieBreaker: row.tieBreaker || 'first'
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = { ...form }
        delete data.id

        if (form.id) {
          await updateSurvey(form.id, data)
          ElMessage.success('更新成功')
        } else {
          await createSurvey(data)
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该问卷吗？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteSurvey(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}

const handleViewQuestions = (row) => {
  router.push({
    path: '/question',
    query: { surveyId: row.id }
  })
}

// 复制问卷链接
const handleCopyLink = (row) => {
  if (!row.slug) {
    ElMessage.warning('该问卷未设置Slug，无法生成分享链接')
    return
  }

  // 使用H5端的域名（通过环境变量配置，默认5173端口）
  const h5Origin = import.meta.env.VITE_H5_ORIGIN || 'http://localhost:5173'
  const url = `${h5Origin}/${row.slug}`

  // 复制到剪贴板
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    // 降级方案
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    ElMessage.success('链接已复制到剪贴板')
  })
}

const handleScoreConfig = (row) => {
  router.push({
    path: '/survey/score-config',
    query: { surveyId: row.id, title: row.title }
  })
}
</script>

<style scoped>
.slug-tag {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.text-placeholder {
  color: var(--color-text-disabled);
}
</style>
