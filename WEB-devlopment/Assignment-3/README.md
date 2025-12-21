# 🔐 Nexus Vault - Secure Notes Application

> **Live Demo:** [https://nexusvalut.selfmade.one/](https://nexusvalut.selfmade.one/)

A Full Stack Web Application developed for **SNA Assignment 3** - A secure notes management system with user authentication, MongoDB integration, and asynchronous task processing.

---

## 📋 Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
  - [Docker (Recommended)](#method-1-docker-recommended)
  - [Without Docker](#method-2-without-docker)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [CI/CD Pipeline](#cicd-pipeline)
- [Assignment Requirements Checklist](#assignment-requirements-checklist)

---

## 🌐 Live Demo

**Production URL:** [https://nexusvalut.selfmade.one/](https://nexusvalut.selfmade.one/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | User registration & login with session management |
| 📝 **CRUD Notes** | Create, Read, Update, Delete personal notes |
| 🛡️ **Session Fingerprinting** | FingerprintJS integration to prevent session hijacking |
| 📧 **Email Notifications** | Welcome emails via RabbitMQ async queue |
| 🔄 **Daily Maintenance** | Automated cron job for cleanup tasks |
| 📱 **Responsive Design** | Mobile-friendly Bootstrap 5 interface |

---

## 🛠️ Technical Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap 5 |
| **Backend** | PHP 8.2 (OOP), RESTful APIs |
| **Database** | MongoDB Atlas (NoSQL) |
| **Containerization** | Docker, Docker Compose |
| **Message Queue** | RabbitMQ |
| **Task Runner** | Grunt.js (CSS/JS minification, file copying) |
| **CI/CD** | GitLab CI/CD |
| **Security** | FingerprintJS, Input Sanitization, Session Management |

---

## 🏗️ Architecture

```
Assignment-3/
├── workspace/                    # Source code & build configuration
│   ├── src/
│   │   ├── backend/              # PHP source files
│   │   ├── frontend/             # HTML, CSS, JS source
│   │   └── assets/               # Raw assets
│   ├── Gruntfile.js              # Grunt task configuration
│   └── package.json              # Node.js dependencies
│
├── htdocs/                       # Production-ready files (served by Apache)
│   ├── api/                      # Backend PHP API
│   │   ├── Database.php          # MongoDB connection handler
│   │   ├── User.php              # User model & authentication
│   │   ├── Note.php              # Notes CRUD operations
│   │   ├── login.php             # Login API endpoint
│   │   ├── register.php          # Registration API endpoint
│   │   └── notes.php             # Notes API endpoint
│   ├── js/                       # Minified JavaScript
│   ├── css/                      # Minified CSS
│   ├── vendor/                   # Composer dependencies
│   └── index.html                # Main entry point
│
├── docker/                       # Docker configuration
│   ├── docker-compose.yml        # Service orchestration
│   ├── Dockerfile                # Web container
│   ├── Dockerfile.worker         # RabbitMQ worker container
│   ├── entrypoint.sh             # Container startup script
│   └── daily_script.sh           # Daily cron job script
│
├── .gitlab-ci.yml                # CI/CD pipeline configuration
├── .env.example                  # Environment variables template
├── README.md                     # This documentation
├── QUICKSTART.md                 # Quick setup guide
└── PRODUCTION_GUIDE.md           # Production deployment guide
```

---

## 🚀 Setup & Installation

### Prerequisites

- Git
- Docker & Docker Compose (for Docker method)
- PHP 8.2+ with MongoDB extension (for non-Docker method)
- Composer
- MongoDB Atlas account (free tier)

---

### Method 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd Assignment-3

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your credentials
# - MONGO_URI: Your MongoDB Atlas connection string
# - MONGO_DB: Database name
# - SMTP settings: For email functionality

# 4. Build and start containers
cd docker
docker-compose up -d --build

# 5. Access the application
# Web App: http://localhost:8080
# RabbitMQ Dashboard: http://localhost:15672
```

#### Docker Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Enter web container
docker exec -it docker-web-1 bash
```

---

### Method 2: Without Docker

```bash
# 1. Clone the repository
git clone <repository-url>
cd Assignment-3/htdocs

# 2. Install PHP dependencies
composer install

# 3. Configure credentials
cp api/config.example.php api/config.php
# Edit api/config.php with your MongoDB URI

# 4. Start PHP development server
php -S 0.0.0.0:8080

# 5. Access at http://localhost:8080
```

#### For Apache Production Server

```bash
# Copy files to Apache's web directory
sudo cp -r htdocs/* /var/www/html/nexus-vault/

# Install dependencies
cd /var/www/html/nexus-vault
composer install --no-dev

# Configure credentials
cp api/config.example.php api/config.php
nano api/config.php

# Set permissions
sudo chown -R www-data:www-data /var/www/html/nexus-vault
sudo systemctl restart apache2
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/register.php` | Register new user | `{email, password, name}` |
| POST | `/api/login.php` | User login | `{email, password, fingerprint}` |
| POST | `/api/logout.php` | User logout | - |

### Notes Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/notes.php` | Get all user notes | - |
| POST | `/api/notes.php` | Create new note | `{title, content}` |
| PUT | `/api/notes.php` | Update note | `{id, title, content}` |
| DELETE | `/api/notes.php` | Delete note | `{id}` |

### Sample API Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| **Session Fingerprinting** | FingerprintJS generates unique browser fingerprint, validated on each request |
| **Password Hashing** | `password_hash()` with bcrypt algorithm |
| **Input Sanitization** | `htmlspecialchars()` on all user inputs |
| **Session Management** | Secure session handling with timeout |
| **CSRF Protection** | Session-based token validation |
| **XSS Prevention** | Output encoding and Content Security Policy |

---

## 🔄 CI/CD Pipeline

The `.gitlab-ci.yml` configures automatic deployment:

```yaml
stages:
  - build
  - test
  - deploy

# Pipeline automatically:
# 1. Builds Docker image
# 2. Runs tests
# 3. Deploys to production server
```

---

## ⏰ Cron Job

A daily maintenance script runs at midnight:

```bash
# Location: docker/daily_script.sh
# Schedule: 0 0 * * * (daily at midnight)

# Tasks:
# - Clean up expired sessions
# - Generate daily summary
# - Database maintenance
```

---

## 📦 Grunt Task Runner

```bash
cd workspace
npm install
npx grunt
```

### Grunt Tasks

| Task | Description |
|------|-------------|
| `uglify` | Minify JavaScript files |
| `cssmin` | Minify CSS files |
| `copy` | Copy PHP files to htdocs |
| `watch` | Watch for file changes |

---

## ✅ Assignment Requirements Checklist

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| **Frontend** | ✅ | HTML, CSS, JavaScript, Bootstrap 5 |
| **Backend** | ✅ | PHP 8.2 with OOP, Session Management |
| **Database** | ✅ | MongoDB Atlas |
| **RESTful APIs** | ✅ | Registration, Login, Notes CRUD |
| **Docker** | ✅ | Dockerfile, docker-compose.yml |
| **CI/CD** | ✅ | .gitlab-ci.yml with auto-deploy |
| **Cron Jobs** | ✅ | Daily maintenance script |
| **Grunt** | ✅ | CSS/JS minification, file copying |
| **RabbitMQ** | ✅ | Async email queue processing |
| **Defensive Programming** | ✅ | Input validation, error handling |
| **Security** | ✅ | FingerprintJS, secure sessions |
| **Domain Setup** | ✅ | nexusvalut.selfmade.one |
| **Project Architecture** | ✅ | workspace/ and htdocs/ structure |

---

## 📁 Deliverables

- ✅ Source code (workspace/, htdocs/)
- ✅ Dockerfile & docker-compose.yml
- ✅ .gitlab-ci.yml
- ✅ README.md with instructions
- ✅ Live site: [https://nexusvalut.selfmade.one/](https://nexusvalut.selfmade.one/)

---

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas URI | `mongodb+srv://user:pass@cluster...` |
| `MONGO_DB` | Database name | `nexus_vault` |
| `RABBITMQ_HOST` | RabbitMQ host | `rabbitmq` |
| `RABBITMQ_PORT` | RabbitMQ port | `5672` |
| `SMTP_HOST` | Email SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | `your@gmail.com` |
| `SMTP_PASS` | App password | `xxxx-xxxx-xxxx` |

---

## 📜 License

This project is developed for educational purposes (SNA Assignment 3).

---

## 👨‍💻 Author

**Dharshan Kumar J**

- Live Demo: [https://nexusvalut.selfmade.one/](https://nexusvalut.selfmade.one/)
- Repository: GitLab

---

*Built with ❤️ for SNA Assignment 3*
