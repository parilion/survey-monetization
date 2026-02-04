<template>
  <div class="survey-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>问卷列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建问卷
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="问卷标题" min-width="200" />
        <el-table-column prop="totalQuestions" label="题目数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="handleViewQuestions(row)">
              题目管理
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        layout="total, prev, pager, next"
        style="margin-top: 20px; justify-content: flex-end"
        @current-change="loadData"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
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
  title: '',
  description: '',
  introText: '',
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入问卷标题', trigger: 'blur' }]
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
    title: '',
    description: '',
    introText: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑问卷'
  Object.assign(form, { ...row })
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
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
