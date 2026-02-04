import request from './request'

// 密码验证
export function verifyPassword(password) {
  return request({
    url: '/password/verify',
    method: 'post',
    data: { password }
  })
}

// 获取问卷详情（包含题目）
export function getSurveyWithQuestions(surveyId) {
  return request({
    url: `/survey/${surveyId}/with-questions`,
    method: 'get'
  })
}

// 提交答题结果
export function submitAnswer(data) {
  return request({
    url: '/answer/submit',
    method: 'post',
    data
  })
}

// 获取答题结果
export function getAnswerResult(passwordId) {
  return request({
    url: `/answer/result/${passwordId}`,
    method: 'get'
  })
}
