# 数据库初始化说明

## 步骤1: 安装MySQL 8.0+

确保你的系统已安装MySQL 8.0或更高版本。

## 步骤2: 创建数据库

使用MySQL客户端或命令行工具执行以下命令：

```bash
mysql -u root -p < schema.sql
```

或者手动执行：

```bash
mysql -u root -p
```

然后在MySQL命令行中执行：

```sql
source G:/demo/RedBook/database/schema.sql
```

## 步骤3: 验证

```sql
USE redbook_survey;
SHOW TABLES;
```

应该看到以下8张表：
- admin_users
- surveys
- questions
- options
- result_templates
- access_passwords
- answer_records
- system_configs

## 步骤4: 更新后端配置

修改 `backend/.env` 文件中的数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的MySQL密码
DB_DATABASE=redbook_survey
```

## 默认管理员账号

- 用户名: admin
- 密码: admin123

**注意**: 首次登录后请及时修改密码！

## Redis 配置

系统需要Redis用于缓存，请确保Redis已安装并运行：

```bash
# 检查Redis是否运行
redis-cli ping
# 应该返回 PONG
```

## 示例数据

数据库创建脚本中已包含：
- 1个默认管理员账号
- 1个示例问卷（需要在管理后台完善题目）
- 系统配置项

## 常见问题

### 1. 连接数据库失败

检查：
- MySQL服务是否启动
- 用户名密码是否正确
- 数据库是否创建成功

### 2. 字符集问题

确保数据库使用 utf8mb4 字符集，支持emoji等特殊字符。

### 3. 时区问题

数据库使用 +08:00 时区（北京时间），与后端配置保持一致。
