# 🔐 Nexus Vault - Secure PHP Application

A Full Stack Web Application developed for SNA Assignment 3.
It features a secure authentication system, MongoDB Atlas integration, and asynchronous task processing using RabbitMQ.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start - Docker (Recommended)](#quick-start---docker-recommended)
- [Quick Start - Without Docker](#quick-start---without-docker)
- [Production Deployment](#production-deployment)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

| Category | Technologies |
|----------|-------------|
| **Frontend** | Responsive UI, Bootstrap 5, minified assets via Grunt |
| **Backend** | PHP 8.2 (OOP), MongoDB Atlas (NoSQL), FingerprintJS |
| **DevOps** | Docker, GitLab CI/CD, RabbitMQ, Cron Jobs |
| **Security** | Session Fingerprinting, Input Sanitization, Environment Variables |

---

## 🏗️ Architecture

```
Assignment-3/
├── workspace/          # Source code & build config
│   ├── src/            # Raw source files
│   └── Gruntfile.js    # Build configuration
├── htdocs/             # Production-ready files (served by Apache/PHP)
│   ├── api/            # Backend PHP API
│   ├── js/             # Frontend JavaScript
│   ├── css/            # Stylesheets
│   └── index.html      # Entry point
├── docker/             # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── Dockerfile.worker
├── .env.example        # Environment template
└── README.md           # This file
```

---

## 🐳 Quick Start - Docker (Recommended)

### Prerequisites
- Docker & Docker Compose installed
- MongoDB Atlas account (free tier works)

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Assignment-3

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your MongoDB Atlas credentials
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/...
# MONGO_DB=nexus_vault

# 4. Start the application
cd docker
docker-compose up -d --build
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Web App** | http://localhost:8080 | - |
| **RabbitMQ Dashboard** | http://localhost:15672 | admin / admin123 |

### Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build
```

---

## 🖥️ Quick Start - Without Docker

### Prerequisites
- PHP 8.2+ with MongoDB extension
- Composer (PHP package manager)
- MongoDB Atlas account

### Option 1: PHP Built-in Server (Development)

```bash
# 1. Navigate to htdocs
cd Assignment-3/htdocs

# 2. Install PHP dependencies
composer install

# 3. Configure credentials
#    Edit htdocs/api/config.php with your MongoDB URI

# 4. Start the server
php -S 0.0.0.0:8080
```

**Access at:** http://localhost:8080

> **Note:** Use `0.0.0.0` instead of `localhost` to allow external access (port forwarding).

### Option 2: Apache Server (Production)

1. **Copy files to Apache's web directory:**
   ```bash
   cp -r htdocs/* /var/www/html/nexus-vault/
   cd /var/www/html/nexus-vault
   composer install
   ```

2. **Edit `api/config.php` with your credentials:**
   ```php
   putenv('MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/...');
   putenv('MONGO_DB=nexus_vault');
   ```

3. **Set permissions:**
   ```bash
   sudo chown -R www-data:www-data /var/www/html/nexus-vault
   ```

4. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

---

## 🚀 Production Deployment

### Method 1: Using Docker (Recommended)

```bash
# On your production server
git clone <repo-url>
cd Assignment-3
cp .env.example .env
nano .env  # Add your real credentials
cd docker
docker-compose up -d --build
```

### Method 2: Using Apache + PHP

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd Assignment-3/htdocs
   composer install --no-dev --optimize-autoloader
   ```

2. **Configure environment variables in `api/config.php`**

3. **Set up Apache VirtualHost:**
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot /path/to/htdocs
       
       <Directory /path/to/htdocs>
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

4. **Enable SSL with Let's Encrypt (optional but recommended):**
   ```bash
   sudo certbot --apache -d yourdomain.com
   ```

For detailed production setup, see [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)

---

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster...` |
| `MONGO_DB` | Database name | `nexus_vault` |
| `MONGO_ALLOW_INVALID_CERTS` | Skip TLS verification (debug only) | `false` |
| `RABBITMQ_HOST` | RabbitMQ hostname | `rabbitmq` or `localhost` |
| `RABBITMQ_PORT` | RabbitMQ port | `5672` |
| `RABBITMQ_USER` | RabbitMQ username | `admin` |
| `RABBITMQ_PASS` | RabbitMQ password | `admin123` |
| `SMTP_HOST` | Email SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password (App Password) | `xxxx-xxxx-xxxx` |

### Configuration Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `.env` | Docker environment variables | Docker deployment |
| `htdocs/api/config.php` | PHP environment variables | Non-Docker deployment |
| `htdocs/.htaccess` | Apache configuration | Apache deployment |

---

## 🔧 Troubleshooting

### MongoDB TLS/SSL Error
```
TLS handshake failed: tlsv1 alert internal error
```

**Solution:** Set `MONGO_ALLOW_INVALID_CERTS=true` in your config.

---

### "Failed to resolve 'mongo'"
```
No suitable servers found: Failed to resolve 'mongo'
```

**Cause:** Environment variables not set.

**Solution:** 
- Docker: Check `.env` file
- Non-Docker: Check `htdocs/api/config.php`

---

### Missing vendor folder
```
Failed opening required '.../vendor/autoload.php'
```

**Solution:** 
```bash
cd htdocs
composer install
```

---

### MongoDB IP Not Whitelisted
```
not authorized on database
```

**Solution:** Go to MongoDB Atlas → Network Access → Add your IP (or `0.0.0.0/0`)

---

## 🔐 Security Features

- **Session Fingerprinting**: FingerprintJS + User Agent + IP hash
- **Defensive Coding**: Strict type checking, exception handling
- **Input Sanitization**: htmlspecialchars on all user input
- **Environment Variables**: Credentials never hardcoded

---

## 🔄 Development Workflow

1. Edit files in `workspace/src/`
2. Run `npx grunt` in `workspace/` to build assets
3. Files are copied to `htdocs/`
4. Refresh browser to see changes

```bash
cd workspace
npm install
npx grunt
```

---

## 📜 License

This project is for educational purposes (SNA Assignment 3).

---

**Built with ❤️ by Dharshan Kumar J**
