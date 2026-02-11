<template>
  <div class="result-list">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="page-title-left">
        <h3 class="page-title">结果模板列表</h3>
        <el-select
          v-model="selectedSurveyId"
          placeholder="选择问卷"
          style="width: 200px"
          clearable
          @change="loadData"
        >
          <el-option
            v-for="survey in surveys"
            :key="survey.id"
            :label="survey.title"
            :value="survey.id"
          />
        </el-select>
      </div>
      <el-button type="primary" @click="handleAdd" :disabled="!selectedSurveyId">
        <el-icon><Plus /></el-icon>
        新建结果模板
      </el-button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <div class="table-card-body">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="resultType" label="结果类型" min-width="130">
            <template #default="{ row }">
              <el-tag size="small">{{ row.resultType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="结果标题" min-width="220" />
          <el-table-column prop="description" label="简短描述" min-width="300" show-overflow-tooltip />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <span class="action-divider"></span>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结果类型" required>
              <el-input v-model="form.resultType" placeholder="如: Citrus, ESTJ" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结果标题" required>
              <el-input v-model="form.title" placeholder="如: 日光柑橘调" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="简短描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="简短描述"
          />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签（可输入新建）"
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          <div class="form-tip">选择或输入标签，用于结果展示</div>
        </el-form-item>

        <el-form-item label="详细内容">
          <el-input
            v-model="form.detailContent"
            type="textarea"
            :rows="5"
            placeholder="详细的性格描述内容"
          />
        </el-form-item>

        <el-form-item label="推荐建议">
          <el-input
            v-model="form.recommendation"
            type="textarea"
            :rows="3"
            placeholder="针对此结果的建议或推荐内容"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="推荐链接">
              <el-input v-model="form.recommendationUrl" placeholder="推荐内容链接" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="图片">
          <el-input v-model="form.imageUrl" placeholder="图片URL" />
        </el-form-item>

        <el-form-item label="分数范围">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input-number v-model="form.minScore" :min="0" placeholder="最小分" />
            </el-col>
            <el-col :span="8">
              <el-input-number v-model="form.maxScore" :min="0" placeholder="最大分" />
            </el-col>
          </el-row>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSurveyList,
  getResultList,
  createResult,
  updateResult,
  deleteResult
} from '@/api'

const loading = ref(false)
const submitting = ref(false)
const route = useRoute()
const dialogVisible = ref(false)
const dialogTitle = ref('新建结果模板')
const formRef = ref()

const surveys = ref([])
const selectedSurveyId = ref(null)
const tableData = ref([])

const form = reactive({
  id: null,
  surveyId: null,
  resultType: '',
  title: '',
  description: '',
  detailContent: '',
  tags: [],
  recommendation: '',
  recommendationUrl: '',
  sortOrder: 0,
  imageUrl: '',
  minScore: 0,
  maxScore: 100
})

// 常用标签
const commonTags = [
  '领导力', '执行力', '创造力', '沟通能力', '团队协作',
  '逻辑思维', '分析能力', '决策力', '责任心', '进取心',
  '外向', '内向', '理性', '感性', '乐观', '悲观',
  '自信', '谦虚', '坚韧', '灵活', '稳重', '热情'
]

onMounted(async () => {
  await loadSurveys()
  // 读取URL参数并自动选择问卷
  const querySurveyId = route.query.surveyId
  if (querySurveyId) {
    selectedSurveyId.value = Number(querySurveyId)
    loadData()
  }
})

const loadSurveys = async () => {
  try {
    const res = await getSurveyList({ page: 1, limit: 100 })
    if (res.code === 200 && res.data) {
      surveys.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载问卷列表失败:', error)
  }
}

const loadData = async () => {
  if (!selectedSurveyId.value) return

  loading.value = true
  try {
    const res = await getResultList({
      surveyId: selectedSurveyId.value
    })
    if (res.code === 200 && res.data) {
      tableData.value = res.data || []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新建结果模板'
  Object.assign(form, {
    id: null,
    surveyId: selectedSurveyId.value,
    resultType: '',
    title: '',
    description: '',
    detailContent: '',
    tags: [],
    recommendation: '',
    recommendationUrl: '',
    sortOrder: 0,
    imageUrl: '',
    minScore: 0,
    maxScore: 100
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑结果模板'
  Object.assign(form, {
    id: row.id,
    surveyId: row.surveyId,
    resultType: row.resultType,
    title: row.title,
    description: row.description,
    detailContent: row.detailContent,
    tags: row.tags || [],
    recommendation: row.recommendation || '',
    recommendationUrl: row.recommendationUrl || '',
    sortOrder: row.sortOrder || 0,
    imageUrl: row.imageUrl || '',
    minScore: row.minScore || 0,
    maxScore: row.maxScore || 100
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.resultType || !form.title) {
    ElMessage.warning('请填写必填项')
    return
  }

  submitting.value = true
  try {
    const data = { ...form }
    const id = data.id
    delete data.id

    if (id) {
      await updateResult(id, data)
      ElMessage.success('更新成功')
    } else {
      await createResult(data)
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

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该结果模板吗？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteResult(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
</style>
