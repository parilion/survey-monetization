import request from './request'

// ========== 问卷管理 ==========
export function getSurveyList(params) {
  return request({ url: '/surveys', method: 'get', params })
}

export function getSurveyDetail(id) {
  return request({ url: `/surveys/${id}`, method: 'get' })
}

export function createSurvey(data) {
  return request({ url: '/surveys', method: 'post', data })
}

export function updateSurvey(id, data) {
  return request({ url: `/surveys/${id}`, method: 'put', data })
}

export function deleteSurvey(id) {
  return request({ url: `/surveys/${id}`, method: 'delete' })
}

// ========== 题目管理 ==========
export function getQuestionList(params) {
  return request({ url: '/question', method: 'get', params })
}

export function getQuestionDetail(id) {
  return request({ url: `/question/${id}`, method: 'get' })
}

export function createQuestion(data) {
  return request({ url: '/question', method: 'post', data })
}

export function batchCreateQuestion(data) {
  return request({ url: '/question/batch', method: 'post', data })
}

export function updateQuestion(id, data) {
  return request({ url: `/question/${id}`, method: 'put', data })
}

export function deleteQuestion(id) {
  return request({ url: `/question/${id}`, method: 'delete' })
}

export function batchDeleteQuestion(ids) {
  return request({ url: '/question/batch', method: 'delete', data: { ids } })
}

// ========== 结果模板管理 ==========
export function getResultList(params) {
  return request({ url: '/result', method: 'get', params })
}

export function getResultDetail(id) {
  return request({ url: `/result/${id}`, method: 'get' })
}

export function createResult(data) {
  return request({ url: '/result', method: 'post', data })
}

export function updateResult(id, data) {
  return request({ url: `/result/${id}`, method: 'put', data })
}

export function deleteResult(id) {
  return request({ url: `/result/${id}`, method: 'delete' })
}

// ========== 密码管理 ==========
export function getPasswordList(params) {
  return request({ url: '/password/list', method: 'get', params })
}

export function generatePassword(data) {
  return request({ url: '/password/generate', method: 'post', data })
}

export function deletePasswords(ids) {
  return request({ url: '/password/batch', method: 'delete', data: { ids } })
}

// ========== 答题记录 ==========
export function getAnswerList(params) {
  return request({ url: '/answer/list', method: 'get', params })
}

export function getAnswerDetail(id) {
  return request({ url: `/answer/${id}`, method: 'get' })
}

// ========== 计分配置管理 ==========
export function getScoreConfig(surveyId) {
  return request({ url: `/score-config/${surveyId}`, method: 'get' })
}

export function getScoreConfigOrCreate(surveyId) {
  return request({ url: `/score-config/${surveyId}/or-create`, method: 'get' })
}

export function createScoreConfig(data) {
  return request({ url: '/score-config', method: 'post', data })
}

export function updateScoreConfig(surveyId, data) {
  return request({ url: `/score-config/${surveyId}`, method: 'put', data })
}

export function deleteScoreConfig(surveyId) {
  return request({ url: `/score-config/${surveyId}`, method: 'delete' })
}
