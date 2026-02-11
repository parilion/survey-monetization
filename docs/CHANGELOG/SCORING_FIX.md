# 计分配置 Bug 文档

## 问题描述

在问卷计分配置页面（`/survey/score-config`），后端 API 返回的 `scoreMode` 值无法正确显示在前端的 Element Plus `el-select` 下拉框中。

## 问题现象

1. **后端返回数据正确**：API `/api/score-config/{surveyId}/or-create` 返回 `"scoreMode": "multi"`
2. **前端显示错误**：页面始终显示 "单类型计分 (SINGLE)"，即使后端返回的是 `"multi"`、`"range"` 或其他值
3. **预设按钮无反应**：点击 "MBTI 预设"、"NPS 预设"、"KPI 预设" 后，下拉框显示和 tag 说明不会更新
4. **保存后刷新依旧**：保存配置后重新进入页面，问题依旧存在

## 测试结果

### API 响应示例

```json
{
  "code": 200,
  "data": {
    "id": 4,
    "surveyId": 1,
    "scoreMode": "multi",  // 正确返回 multi 类型
    "resultTypeField": "",
    "resultTypeLength": 1,
    "dimensions": [],
    "ranges": [],
    "metrics": [],
    "gradeRules": [],
    "formulaTemplate": "",
    "tieBreaker": "first",
    "remark": "",
    "createdAt": "2026-02-05T09:41:40.000Z",
    "updatedAt": "2026-02-05T12:18:56.000Z",
    "isNew": false
  }
}
```

### 页面显示

- API 返回 `scoreMode: "multi"`
- 页面显示：**单类型计分 (SINGLE)**
- el-tag 显示：**适用于简单测试，如性格测试**（对应 single 模式）

## 代码分析

### 前端组件 (`admin/src/views/survey/ScoreConfig.vue`)

```vue
<el-select v-model="config.scoreMode" @change="handleModeChange">
  <el-option label="单类型计分 (SINGLE)" value="single" />
  <el-option label="多类型计分 (MULTI)" value="multi" />
  <el-option label="范围值计分 (RANGE)" value="range" />
  <el-option label="多维度计分 (MULTI_DIMENSION)" value="multi_dimension" />
  <el-option label="KPI 考核 (KPI)" value="kpi" />
  <el-option label="自定义公式 (FORMULA)" value="custom_formula" />
</el-select>
```

### 数据加载逻辑

```javascript
const config = reactive({
  surveyId: null,
  scoreMode: 'single',  // 默认值
  // ...
})

const loadConfig = async () => {
  const res = await getScoreConfigOrCreate(surveyId.value)
  if (res.code === 200 && res.data) {
    hasExistingConfig.value = !res.data.isNew

    // 尝试使用 Object.assign
    Object.assign(config, {
      surveyId: res.data.surveyId,
      scoreMode: res.data.scoreMode || 'single',  // 应该设为 multi
      // ...
    })
  }
}
```

## 排查过程

### 1. 检查 API 返回值 ✅
- API 返回的 `scoreMode` 值正确（`"multi"`）

### 2. 检查 Vue 响应式 ✅
- `Object.assign()` 执行后，`config.scoreMode` 理论上已更新
- Vue DevTools 显示的值正确

### 3. 检查 Element Plus el-select 组件 ❌
- el-select 的选中状态未更新
- 下拉框仍显示默认的 "单类型计分 (SINGLE)"

### 4. 尝试的修复方案

#### 方案 1：直接赋值
```javascript
config.scoreMode = res.data.scoreMode || 'single'
```
**结果**：失败，el-select 未更新

#### 方案 2：使用 computed 属性
```javascript
const scoreMode = computed({
  get: () => config.scoreMode,
  set: (val) => { config.scoreMode = val }
})
```
**结果**：失败，el-select 仍未更新

#### 方案 3：双重 Object.assign
```javascript
Object.assign(config, newData)
Object.assign(config, { ...config })
```
**结果**：失败

## 根本原因分析

Element Plus 的 `el-select` 组件在 Vue 3 中对 `reactive` 对象的响应式更新可能存在兼容性问题。具体表现为：

1. `el-option` 的选中状态基于 `v-model` 绑定的值
2. 当使用 `Object.assign` 更新 `reactive` 对象时，el-select 可能未正确监听到变化
3. el-select 内部可能缓存了初始值，导致无法正确响应变化

## 受影响的文件

- `admin/src/views/survey/ScoreConfig.vue` - 计分配置页面

## 解决方案（待验证）

### 方案 A：使用 ref 替代 reactive
```javascript
const config = ref({
  scoreMode: 'single',
  // ...
})

const loadConfig = async () => {
  const res = await getScoreConfigOrCreate(surveyId.value)
  if (res.code === 200 && res.data) {
    config.value = { ...config.value, ...res.data }
  }
}
```

### 方案 B：强制 el-select 重新渲染
```javascript
const scoreModeKey = ref(0) // 用于强制刷新

const loadConfig = async () => {
  // ... 加载数据
  scoreModeKey.value++ // 强制更新 key
}

// 模板中
<el-select :key="scoreModeKey" v-model="config.scoreMode">
```

### 方案 C：使用 watch 监听变化
```javascript
watch(() => config.scoreMode, (newVal) => {
  // 强制更新 el-select
  const select = document.querySelector('.el-select')
  if (select && select.__vue__) {
    select.__vue__.cachedModelValue = newVal
  }
})
```

## 复现步骤

1. 进入管理后台（`http://localhost:5174`）
2. 进入问卷管理页面
3. 点击任意问卷的 "计分配置" 按钮
4. 观察计分模式下拉框的值

## 期望行为

后端返回什么 `scoreMode`，前端就应该显示对应的选项：
- `single` → "单类型计分 (SINGLE)"
- `multi` → "多类型计分 (MULTI)"
- `range` → "范围值计分 (RANGE)"
- `multi_dimension` → "多维度计分 (MULTI_DIMENSION)"
- `kpi` → "KPI 考核 (KPI)"
- `custom_formula` → "自定义公式 (FORMULA)"

## 相关截图

（测试时发现问题，可添加截图）

## 发现时间

2026-02-05

## 状态

**✅ 已修复** - 2026-02-05

## 解决方案

问题根源有两个：

1. **后端 API 响应格式不一致**：后端直接返回数据对象，但前端代码错误地使用了 `res.code` 和 `res.data` 访问数据
2. **Vue 3 响应式问题**：使用 `reactive()` 配合 `Object.assign()` 更新时，Element Plus 的 `el-select` 组件无法正确响应变化

### 修复方法

**方法一：修复 API 响应处理（已采用）**
```javascript
// 修改前（错误）
const res = await getScoreConfigOrCreate(surveyId.value)
if (res.code === 200 && res.data) {
  config.value = res.data  // 错误：res 本身就是数据
}

// 修改后（正确）
const res = await getScoreConfigOrCreate(surveyId.value)
if (res) {
  config.value = {
    scoreMode: res.scoreMode,  // 直接访问 res
    // ...
  }
}
```

**方法二：将 reactive 改为 ref（已采用）**
```javascript
// 修改前
const config = reactive({
  scoreMode: 'single'
})

// 修改后
const config = ref({
  scoreMode: 'single'
})

// 更新数据时直接替换整个对象
config.value = { ...newData }
```

### 修改的文件

- `admin/src/views/survey/ScoreConfig.vue`
  - 将 `config` 从 `reactive()` 改为 `ref()`
  - 修复 `loadConfig()` 函数的 API 响应处理
  - 修复 `applyPreset()` 函数的 API 响应处理
  - 修复 `handleSave()` 函数的 API 响应处理
  - 所有 script 中访问 config 需要使用 `.value`
  - 模板中的 config 会自动解包，不需要 `.value`
