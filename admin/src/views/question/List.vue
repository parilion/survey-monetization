<template>
  <div class="question-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-space>
            <span>题目列表</span>
            <el-select
              v-model="selectedSurveyId"
              placeholder="选择问卷"
              style="width: 200px"
              @change="loadData"
            >
              <el-option
                v-for="survey in surveys"
                :key="survey.id"
                :label="survey.title"
                :value="survey.id"
              />
            </el-select>
          </el-space>
          <el-button type="primary" @click="handleAdd" :disabled="!selectedSurveyId">
            <el-icon><Plus /></el-icon>
            新建题目
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="sortOrder" label="序号" width="80" />
        <el-table-column prop="title" label="题目内容" min-width="300" />
        <el-table-column label="选项数量" width="100">
          <template #default="{ row }">
            {{ row.options?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="questionType" label="类型" width="100">
          <template #default="{ row }">
            {{ row.questionType === 'single' ? '单选' : '多选' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="题目内容" required>
          <el-input v-model="form.title" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="排序序号" required>
          <el-input-number v-model="form.sortOrder" :min="1" />
        </el-form-item>
        <el-form-item label="题目类型">
          <el-radio-group v-model="form.questionType">
            <el-radio value="single">单选</el-radio>
            <el-radio value="multiple">多选</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选项列表">
          <div style="width: 100%">
            <div
              v-for="(option, index) in form.options"
              :key="index"
              style="margin-bottom: 10px; display: flex; gap: 10px"
            >
              <el-input
                v-model="option.content"
                placeholder="选项内容"
                style="flex: 1"
              />
              <el-input
                v-model="option.scoreType"
                placeholder="计分类型(如:Citrus)"
                style="width: 150px"
              />
              <el-button
                type="danger"
                size="small"
                @click="removeOption(index)"
              >
                删除
              </el-button>
            </div>
            <el-button @click="addOption" size="small">
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>
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
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSurveyList,
  getQuestionList,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from '@/api'

const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建题目')
const formRef = ref()

const surveys = ref([])
const selectedSurveyId = ref(null)
const tableData = ref([])

const form = reactive({
  id: null,
  surveyId: null,
  title: '',
  sortOrder: 1,
  questionType: 'single',
  options: [
    { content: '', scoreType: '', sortOrder: 0 },
    { content: '', scoreType: '', sortOrder: 1 }
  ]
})

onMounted(async () => {
  await loadSurveys()
  if (route.query.surveyId) {
    selectedSurveyId.value = Number(route.query.surveyId)
    await loadData()
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
    const res = await getQuestionList({
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
  dialogTitle.value = '新建题目'
  Object.assign(form, {
    id: null,
    surveyId: selectedSurveyId.value,
    title: '',
    sortOrder: tableData.value.length + 1,
    questionType: 'single',
    options: [
      { content: '', scoreType: '', sortOrder: 0 },
      { content: '', scoreType: '', sortOrder: 1 }
    ]
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑题目'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const addOption = () => {
  form.options.push({
    content: '',
    scoreType: '',
    sortOrder: form.options.length
  })
}

const removeOption = (index) => {
  if (form.options.length <= 2) {
    ElMessage.warning('至少保留2个选项')
    return
  }
  form.options.splice(index, 1)
}

const handleSubmit = async () => {
  if (!form.title) {
    ElMessage.warning('请输入题目内容')
    return
  }

  if (form.options.length < 2) {
    ElMessage.warning('至少需要2个选项')
    return
  }

  submitting.value = true
  try {
    const data = { ...form }
    const id = data.id
    delete data.id

    if (id) {
      await updateQuestion(id, data)
      ElMessage.success('更新成功')
    } else {
      await createQuestion(data)
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
  ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteQuestion(row.id)
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
