# 生产环境部署指南

本文档提供完整的生产环境部署步骤和配置说明。

## 📋 部署前检查清单

### 服务器要求

- [ ] 操作系统：Linux（推荐 Ubuntu 20.04+ 或 CentOS 7+）
- [ ] Node.js >= 18.0.0
- [ ] MySQL >= 8.0
- [ ] Nginx >= 1.18
- [ ] Redis >= 6.0（可选，推荐）
- [ ] PM2（进程管理）
- [ ] SSL证书（生产环境必须）

### 域名准备

- [ ] H5用户端域名（如：survey.example.com）
- [ ] 管理后台域名（如：admin.example.com）
- [ ] API后端域名（如：api.example.com）
- [ ] 域名已解析到服务器IP

### 安全检查

- [ ] 已修改默认管理员密码
- [ ] 已生成新的JWT_SECRET
- [ ] 已配置防火墙规则
- [ ] 已准备SSL证书
- [ ] 已配置备份策略

## 🚀 部署步骤

### 步骤1：服务器环境准备

#### 1.1 安装Node.js

```bash
# 使用nvm安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node --version  # 确认版本 >= 18.0.0
```

#### 1.2 安装MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation

# CentOS/RHEL
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

#### 1.3 安装Redis（可选）

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis
```

#### 1.4 安装Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# CentOS/RHEL
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 1.5 安装PM2

```bash
npm install -g pm2
pm2 --version
```

### 步骤2：数据库初始化

#### 2.1 创建数据库用户

```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库
CREATE DATABASE redbook_survey DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户并授权
CREATE USER 'redbook'@'localhost' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON redbook_survey.* TO 'redbook'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2.2 导入数据库表结构

```bash
# 上传database/schema.sql到服务器
# 然后执行
mysql -u redbook -p redbook_survey < /path/to/schema.sql
```

#### 2.3 更新管理员密码

```bash
# 登录MySQL
mysql -u redbook -p redbook_survey

# 生成bcrypt密码（需要在Node.js环境中）
# 或使用在线工具生成，然后更新数据库
UPDATE admin_users SET password = '$2b$10$你的bcrypt密码' WHERE username = 'admin';
```

### 步骤3：后端部署

#### 3.1 上传代码

```bash
# 在服务器创建目录
mkdir -p /var/www/redbook
cd /var/www/redbook

# 上传backend文件夹到服务器
# 可以使用git clone或scp上传
```

#### 3.2 配置环境变量

```bash
cd /var/www/redbook/backend
cp .env.example .env
nano .env
```

编辑.env文件：

```env
# 应用配置
NODE_ENV=production
PORT=3000
APP_NAME=RedBook Survey System

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=redbook
DB_PASSWORD=你的数据库密码
DB_DATABASE=redbook_survey

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT配置（必须修改为随机字符串）
JWT_SECRET=生成一个32位以上的随机字符串
JWT_EXPIRES_IN=7d

# 密码配置
PASSWORD_VALIDITY_HOURS=12

# CORS配置（修改为你的实际域名）
CORS_ORIGIN=https://survey.example.com,https://admin.example.com
```

#### 3.3 安装依赖并构建

```bash
cd /var/www/redbook/backend
npm install --production
npm run build
```

#### 3.4 使用PM2启动

```bash
# 创建PM2配置文件
nano ecosystem.config.js
```

ecosystem.config.js内容：

```javascript
module.exports = {
  apps: [{
    name: 'redbook-api',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
}
```

启动服务：

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs redbook-api

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤4：前端部署

#### 4.1 H5用户端构建

在本地开发机器上：

```bash
cd h5

# 修改API地址（如果需要）
# 编辑vite.config.js中的proxy配置

# 构建生产版本
npm run build

# 会生成 dist 文件夹
```

上传到服务器：

```bash
# 上传dist文件夹到服务器
scp -r dist/* user@server:/var/www/redbook/h5
```

#### 4.2 管理后台构建

在本地开发机器上：

```bash
cd admin

# 构建生产版本
npm run build

# 会生成 dist 文件夹
```

上传到服务器：

```bash
# 上传dist文件夹到服务器
scp -r dist/* user@server:/var/www/redbook/admin
```

### 步骤5：Nginx配置

#### 5.1 配置API后端

```bash
sudo nano /etc/nginx/sites-available/redbook-api
```

内容：

```nginx
upstream redbook_api {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.example.com;

    # 强制HTTPS（生产环境）
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL证书配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 日志
    access_log /var/log/nginx/redbook-api.access.log;
    error_log /var/log/nginx/redbook-api.error.log;

    location / {
        proxy_pass http://redbook_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5.2 配置H5用户端

```bash
sudo nano /etc/nginx/sites-available/redbook-h5
```

内容：

```nginx
server {
    listen 80;
    server_name survey.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name survey.example.com;

    # SSL证书
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/redbook/h5;
    index index.html;

    # 日志
    access_log /var/log/nginx/redbook-h5.access.log;
    error_log /var/log/nginx/redbook-h5.error.log;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 代理API请求到后端
    location /api {
        proxy_pass https://api.example.com;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 5.3 配置管理后台

```bash
sudo nano /etc/nginx/sites-available/redbook-admin
```

内容：

```nginx
server {
    listen 80;
    server_name admin.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.example.com;

    # SSL证书
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/redbook/admin;
    index index.html;

    # 日志
    access_log /var/log/nginx/redbook-admin.access.log;
    error_log /var/log/nginx/redbook-admin.error.log;

    # IP白名单（可选，提高安全性）
    # allow 123.456.789.0/24;  # 允许的IP段
    # deny all;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://api.example.com;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5.4 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/redbook-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/redbook-h5 /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/redbook-admin /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 步骤6：防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 步骤7：SSL证书配置

#### 使用Let's Encrypt免费证书

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu
sudo yum install certbot python3-certbot-nginx  # CentOS

# 自动配置
sudo certbot --nginx -d api.example.com
sudo certbot --nginx -d survey.example.com
sudo certbot --nginx -d admin.example.com

# 设置自动续期
sudo certbot renew --dry-run
```

## 🔒 安全加固

### 1. 数据库安全

```bash
# 禁用远程root登录
# 编辑MySQL配置
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加
bind-address = 127.0.0.1

# 重启MySQL
sudo systemctl restart mysql
```

### 2. 定期备份

创建备份脚本：

```bash
nano /var/www/redbook/backup.sh
```

内容：

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/redbook"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u redbook -p你的密码 redbook_survey > $BACKUP_DIR/db_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/db_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

设置定时任务：

```bash
chmod +x /var/www/redbook/backup.sh
crontab -e

# 添加每天凌晨2点备份
0 2 * * * /var/www/redbook/backup.sh
```

### 3. 监控和日志

```bash
# 查看PM2日志
pm2 logs redbook-api

# 查看Nginx日志
sudo tail -f /var/log/nginx/redbook-*.log

# 设置PM2监控
pm2 install pm2-server-monit
pm2 monit
```

## 📊 性能优化

### 1. 启用Redis缓存

在后端代码中配置Redis连接，缓存热点数据。

### 2. 数据库优化

```sql
-- 添加索引（如果还未添加）
CREATE INDEX idx_password_status ON access_passwords(status, expires_at);
CREATE INDEX idx_answer_survey ON answer_records(survey_id, completed_at);
```

### 3. CDN配置

建议将静态资源上传到CDN，提高访问速度。

## ✅ 部署检查清单

部署完成后，逐一检查：

- [ ] 后端API可访问：https://api.example.com/api
- [ ] H5前端可访问：https://survey.example.com
- [ ] 管理后台可访问：https://admin.example.com
- [ ] 管理员可以登录
- [ ] 可以创建问卷和题目
- [ ] 可以生成密码
- [ ] H5端可以验证密码
- [ ] 可以完成答题
- [ ] 可以查看结果
- [ ] SSL证书有效
- [ ] 防火墙规则正确
- [ ] 数据库备份正常

## 🚨 紧急回滚

如果部署后出现问题，快速回滚：

```bash
# 停止PM2服务
pm2 stop redbook-api

# 恢复数据库
mysql -u redbook -p redbook_survey < /var/backups/redbook/db_最近的备份.sql

# 恢复代码到之前版本（如果使用git）
cd /var/www/redbook/backend
git checkout 上一个稳定版本

# 重新启动
pm2 restart redbook-api
```

## 📞 技术支持

部署过程中如遇问题，请查看：
- PM2日志：`pm2 logs`
- Nginx错误日志：`/var/log/nginx/error.log`
- MySQL日志：`/var/log/mysql/error.log`

---

**部署建议：**
- 先在测试服务器完整走一遍流程
- 准备回滚方案
- 选择业务低峰期部署
- 部署后进行完整的功能测试

祝部署顺利！🎉
