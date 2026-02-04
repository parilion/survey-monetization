<template>
  <div class="password-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-space>
            <span>密码列表</span>
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
            <el-select
              v-model="selectedStatus"
              placeholder="密码状态"
              style="width: 120px"
              clearable
              @change="loadData"
            >
              <el-option label="未使用" :value="0" />
              <el-option label="已使用" :value="1" />
              <el-option label="已过期" :value="2" />
            </el-select>
          </el-space>
          <el-button type="primary" @click="handleGenerate">
            <el-icon><Plus /></el-icon>
            批量生成密码
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="password" label="密码" width="120" />
        <el-table-column prop="surveyTitle" label="所属问卷" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.status === 0
                  ? 'success'
                  : row.status === 1
                    ? 'info'
                    : 'danger'
              "
            >
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="generatedAt" label="生成时间" width="180" />
        <el-table-column prop="expiresAt" label="过期时间" width="180" />
        <el-table-column prop="usedAt" label="使用时间" width="180" />
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

    <!-- 生成密码对话框 -->
    <el-dialog v-model="dialogVisible" title="批量生成密码" width="500px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="选择问卷" required>
          <el-select v-model="form.surveyId" placeholder="请选择问卷">
            <el-option
              v-for="survey in surveys"
              :key="survey.id"
              :label="survey.title"
              :value="survey.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生成数量" required>
          <el-input-number v-model="form.count" :min="1" :max="1000" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定生成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSurveyList, getPasswordList, generatePassword } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref()

const surveys = ref([])
const selectedSurveyId = ref(null)
const selectedStatus = ref(null)
const tableData = ref([])

const pagination = reactive({
  page: 1,
  limit: 50,
  total: 0
})

const form = reactive({
  surveyId: null,
  count: 10
})

onMounted(async () => {
  await loadSurveys()
  await loadData()
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
  loading.value = true
  try {
    const res = await getPasswordList({
      surveyId: selectedSurveyId.value,
      status: selectedStatus.value,
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

const handleGenerate = () => {
  form.surveyId = selectedSurveyId.value || null
  form.count = 10
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.surveyId) {
    ElMessage.warning('请选择问卷')
    return
  }

  submitting.value = true
  try {
    const res = await generatePassword(form)
    if (res.code === 200) {
      ElMessage.success(`成功生成 ${res.data.count} 个密码`)
      dialogVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('生成失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
