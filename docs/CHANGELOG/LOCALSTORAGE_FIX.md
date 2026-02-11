# Bug 修复：H5 前端 localStorage 缓存导致数据混淆

## 问题描述

**报告日期：** 2026-02-07

**现象：** 用户访问"综合素质评估"问卷时，显示的题目是"你是谁"（选项：王一、赵二、张三、李四），与问卷完全不匹配。

## 根本原因

localStorage 缓存机制导致不同问卷的数据混淆：

1. 所有问卷共用同一个存储 key `survey_data`
2. 切换问卷时，旧问卷的题目数据没有清除

### 问题触发条件

1. 用户完成问卷 A → 数据存入 localStorage
2. 用户访问问卷 B → `restoreFromStorage()` 恢复问卷 A 的 questions
3. surveyId 被更新为问卷 B，但 questions 还是问卷 A 的
4. SurveyIntro 检查 `questions.length !== 0` → 跳过加载
5. **显示错误的题目**

### 有 Bug 的代码流程

**PasswordVerify.vue:**
```javascript
onMounted(async () => {
  // 1. 恢复 localStorage 中的所有数据（包括旧问卷的 questions）
  const restored = surveyStore.restoreFromStorage()

  // 2. 加载当前问卷信息，更新 surveyId
  if (slug) {
    await loadSurvey(slug)  // surveyId 变了，但 questions 没清除
  }
})
```

**SurveyIntro.vue:**
```javascript
// 只检查是否有题目，没检查题目是否属于当前问卷
if (surveyStore.questions.length === 0) {
  await loadQuestions()
}
```

## 解决方案

**决策：移除 localStorage 缓存机制**

原因：
- 断点续答功能不需要保留
- 每次访问都应该从 API 获取最新数据
- 彻底避免缓存导致的数据混乱

### 修改后的数据流

```
用户访问链接 → clearAll() 清空旧数据 → 验证密码 → 从 API 获取问卷和题目 → 答题 → 提交
```

## 代码修改

### 1. h5/src/stores/survey.js

**删除的方法：**
- `saveToStorage()` - 整个方法
- `restoreFromStorage()` - 整个方法

**移除的调用（共 8 处）：**
- `setPasswordInfo()` 中的 `this.saveToStorage()`
- `setQuestions()` 中的 `this.saveToStorage()`
- `saveAnswer()` 中的 `this.saveToStorage()`
- `nextQuestion()` 中的 `this.saveToStorage()`
- `prevQuestion()` 中的 `this.saveToStorage()`
- `goToQuestion()` 中的 `this.saveToStorage()`
- `setResult()` 中的 `this.saveToStorage()`
- `resetTest()` 中的 `this.saveToStorage()`

**简化的方法：**
```javascript
// 修改前
clearAll() {
  this.$reset()
  localStorage.removeItem('survey_data')
}

// 修改后
clearAll() {
  this.$reset()
}
```

### 2. h5/src/views/PasswordVerify.vue

**删除的内容：**
- `hasHistory` 响应式变量
- `onMounted` 中的 `restoreFromStorage()` 调用
- `handleRestart()` 方法
- 模板中的"重新开始"提示区域
- 相关 CSS 样式

**新增的逻辑：**
```javascript
onMounted(async () => {
  // 清除之前的数据，确保每次访问都是全新的状态
  surveyStore.clearAll()

  // 加载问卷信息
  if (slug) {
    await loadSurvey(slug)
  }
})
```

### 3. h5/src/views/SurveyIntro.vue

**修改前：**
```javascript
// 加载问卷题目
if (surveyStore.questions.length === 0) {
  await loadQuestions()
}
```

**修改后：**
```javascript
// 始终从API加载问卷题目，确保数据最新
await loadQuestions()
```

## 影响范围

- H5 用户端的答题流程
- 不再支持断点续答（刷新页面需重新验证密码）
- 不再有"检测到未完成测试"的提示

## 验证方法

1. 启动 H5 前端服务
2. 访问问卷 A，完成部分答题
3. 访问问卷 B，验证显示的是问卷 B 的题目（不是问卷 A 的）
4. 刷新页面，验证需要重新验证密码

## 相关文件

- `h5/src/stores/survey.js` - 状态管理
- `h5/src/views/PasswordVerify.vue` - 密码验证页
- `h5/src/views/SurveyIntro.vue` - 问卷介绍页
- `docs/ARCHITECTURE.md` - 架构文档（已同步更新）

---

**修复版本:** 1.1
**修复日期:** 2026-02-07
