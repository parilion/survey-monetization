<template>
  <div class="result-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-space>
            <span>结果模板列表</span>
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
          </el-space>
          <el-button type="primary" @click="handleAdd" :disabled="!selectedSurveyId">
            <el-icon><Plus /></el-icon>
            新建结果模板
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="resultType" label="结果类型" width="150" />
        <el-table-column prop="title" label="结果标题" min-width="200" />
        <el-table-column prop="description" label="简短描述" min-width="250" show-overflow-tooltip />
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
        <el-form-item label="结果类型" required>
          <el-input v-model="form.resultType" placeholder="如: Citrus, Rose" />
        </el-form-item>
        <el-form-item label="结果标题" required>
          <el-input v-model="form.title" placeholder="如: 日光柑橘调" />
        </el-form-item>
        <el-form-item label="简短描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="简短描述"
          />
        </el-form-item>
        <el-form-item label="详细内容">
          <el-input
            v-model="form.detailContent"
            type="textarea"
            :rows="5"
            placeholder="详细的性格描述内容"
          />
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
  detailContent: ''
})

onMounted(async () => {
  await loadSurveys()
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
    detailContent: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑结果模板'
  Object.assign(form, { ...row })
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
