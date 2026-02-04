<template>
  <div class="answer-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-space>
            <span>答题记录</span>
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
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="password" label="密码" width="120" />
        <el-table-column prop="surveyTitle" label="问卷" min-width="200" />
        <el-table-column prop="resultType" label="结果类型" width="150" />
        <el-table-column prop="resultScore" label="得分" width="100" />
        <el-table-column prop="userIp" label="用户IP" width="150" />
        <el-table-column prop="completedAt" label="完成时间" width="180" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSurveyList, getAnswerList } from '@/api'

const loading = ref(false)

const surveys = ref([])
const selectedSurveyId = ref(null)
const tableData = ref([])

const pagination = reactive({
  page: 1,
  limit: 50,
  total: 0
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
    const res = await getAnswerList({
      surveyId: selectedSurveyId.value,
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
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
