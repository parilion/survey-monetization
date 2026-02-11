# 密码系统重构记录

**重构日期:** 2026-02-07
**版本:** 1.0

---

## 1. 重构背景

原系统采用"一次性密码"设计，用户验证密码后立即标记为已使用，无法再次访问。这导致用户在以下场景中体验不佳：

- 答题中途刷新页面，无法继续
- 想要重新测试，需要获取新密码
- 网络问题导致中断后无法恢复

---

## 2. 重构目标

将密码从"一次性使用"改为"12小时有效期内可重复使用"，同时简化系统设计。

---

## 3. 设计决策

| 问题 | 决策 |
|-----|------|
| 有效期起点 | 从密码生成时开始计算12小时 |
| 答题记录 | 不保留，答完只返回结果不存数据库 |
| 旧数据处理 | 清除历史数据，重新生成 |
| 状态设计 | 简化为"可使用"和"已过期"两种 |

---

## 4. 新旧设计对比

| 项目 | 旧设计 | 新设计 |
|-----|--------|--------|
| 状态值 | 0=未使用, 1=已使用, 2=已过期 | 0=可使用, 1=已过期 |
| 验证后行为 | 立即标记 status=1（一次性） | 保持 status=0（可重复使用） |
| 过期处理 | 验证时手动标记 status=2 | 验证时检查 expiresAt，过期则返回错误 |
| 答题记录 | 存入 answer_records 表 | 不存储，只返回结果 |
| 密码表字段 | 包含 used_at, user_ip, user_agent | 移除这些字段 |

---

## 5. 修改的文件

### 5.1 后端

| 文件 | 修改内容 |
|-----|---------|
| `entities/access-password.entity.ts` | 删除 usedAt/userIp/userAgent 字段，简化状态注释 |
| `modules/password/password.service.ts` | 验证后不再标记 status=1，支持重复使用 |
| `modules/password/password.controller.ts` | 简化验证接口，移除 IP/UA 参数 |
| `modules/answer/answer.service.ts` | 不存储答题记录，只计算并返回结果 |
| `modules/answer/answer.controller.ts` | 移除 getResult/findAll/findOne 接口 |
| `modules/answer/answer.module.ts` | 移除 AnswerRecord 实体引用 |

### 5.2 管理后台

| 文件 | 修改内容 |
|-----|---------|
| `router/index.js` | 删除答题记录路由 |
| `views/Layout.vue` | 删除侧边栏"答题记录"菜单 |
| `views/password/List.vue` | 简化状态筛选，移除"使用时间"列 |
| `views/answer/` | **整个目录删除** |

### 5.3 数据库

执行迁移脚本 `database/migrations/002_password_system_refactor.sql`：

```sql
-- 清空密码表和答题记录表
TRUNCATE TABLE access_passwords;
TRUNCATE TABLE answer_records;

-- 删除不需要的字段
ALTER TABLE access_passwords DROP COLUMN IF EXISTS used_at;
ALTER TABLE access_passwords DROP COLUMN IF EXISTS user_ip;
ALTER TABLE access_passwords DROP COLUMN IF EXISTS user_agent;

-- 更新状态字段注释
ALTER TABLE access_passwords
MODIFY COLUMN status TINYINT DEFAULT 0 COMMENT '状态: 0=可使用, 1=已过期';
```

---

## 6. 密码验证流程

### 新流程

```
用户输入密码
    ↓
查询密码记录
    ↓
检查 status === 1 → 返回"密码已过期"
    ↓
检查 now > expiresAt → 更新 status=1，返回"密码已过期"
    ↓
检查问卷状态 → 未启用则返回"问卷不可用"
    ↓
返回成功（不修改 status，可重复使用）
```

### 答题提交流程

```
用户提交答案
    ↓
验证密码有效性（同上）
    ↓
获取选项信息
    ↓
计算结果
    ↓
匹配结果模板
    ↓
直接返回结果（不存数据库）
```

---

## 7. 验证方案

1. 生成一个新密码
2. 第一次验证 → 成功，进入问卷
3. 刷新页面，再次验证同一密码 → 成功（验证可重复使用）
4. 完成答题 → 返回结果
5. 再次用同一密码答题 → 成功，返回新结果
6. 等待12小时后验证 → 失败，提示已过期

---

## 8. 注意事项

### 8.1 向后兼容性

- 旧密码数据已清空，需要重新生成
- 答题记录历史数据已清空
- `answer_records` 表结构保留，但不再使用

### 8.2 配置项

密码有效期可通过环境变量配置：

```env
PASSWORD_VALIDITY_HOURS=12
```

### 8.3 隐私保护

重构后系统不再存储：
- 用户 IP 地址
- 用户浏览器标识
- 答题详细记录

这符合数据最小化原则，降低隐私风险。

---

## 9. 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 系统架构文档（已更新）
- [SCORING_SYSTEM.md](./SCORING_SYSTEM.md) - 计分系统文档

---

**文档维护者:** Claude Code
**最后更新:** 2026-02-07
