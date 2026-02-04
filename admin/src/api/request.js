import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    console.error('请求错误:', error)
    let message = '网络错误，请稍后重试'
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        message = '未授权，请重新登录'
        localStorage.removeItem('admin_token')
        window.location.href = '/login'
      } else if (status === 400) {
        message = data.message || '请求参数错误'
      } else if (status === 404) {
        message = '请求的资源不存在'
      } else if (status === 500) {
        message = '服务器错误'
      }
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request
