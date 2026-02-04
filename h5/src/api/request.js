import axios from 'axios'
import { showToast } from 'vant'

// 创建axios实例
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

    // 如果返回的code不是200，则认为是错误
    if (res.code && res.code !== 200) {
      showToast({
        message: res.message || '请求失败',
        position: 'top'
      })
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  (error) => {
    console.error('请求错误:', error)

    let message = '网络错误，请稍后重试'

    if (error.response) {
      const { status, data } = error.response
      if (status === 400) {
        message = data.message || '请求参数错误'
      } else if (status === 404) {
        message = '请求的资源不存在'
      } else if (status === 500) {
        message = '服务器错误'
      }
    }

    showToast({
      message,
      position: 'top'
    })

    return Promise.reject(error)
  }
)

export default request
