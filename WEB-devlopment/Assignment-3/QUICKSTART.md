# 🚀 Quick Start Guide - Nexus Vault

This guide will get your application running in **under 5 minutes**.

---

## Prerequisites

- **Docker** & **Docker Compose** installed
- **MongoDB Atlas** account (free tier works)
- **Gmail account** with App Password (for email features)

---

## Step 1: Clone & Navigate

```bash
git clone <your-repo-url>
cd Assignment-3
```

---

## Step 2: Create Your `.env` File

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# MongoDB Atlas (Required)
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=nexus_vault

# RabbitMQ (Keep defaults for local)
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASS=admin123

# Email (Optional - for welcome emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Nexus Vault

# App Settings
APP_NAME=Nexus Vault
APP_URL=http://localhost:8080
```

### Getting Your MongoDB Atlas URI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (or use existing)
3. Click **Connect** → **Drivers** → Copy the connection string
4. Replace `<password>` with your actual password

### Important: Whitelist Your IP

1. In MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Add `0.0.0.0/0` (allows all IPs) or your specific IP

---

## Step 3: Start the Application

```bash
cd docker
docker-compose up -d --build
```

This will:
- ✅ Build the PHP web container
- ✅ Start RabbitMQ message broker
- ✅ Start the background worker

---

## Step 4: Access the Application

| Service | URL |
|---------|-----|
| **Web App** | http://localhost:8080 |
| **RabbitMQ Dashboard** | http://localhost:15672 (admin/admin123) |

---

## Troubleshooting

### MongoDB TLS/SSL Error

If you see: `TLS handshake failed: tlsv1 alert internal error`

**Solution:** Add this to your `.env`:
```env
MONGO_ALLOW_INVALID_CERTS=true
```

Then restart:
```bash
docker-compose restart
```

### Container Not Starting

Check logs:
```bash
docker-compose logs web
docker-compose logs worker
```

### IP Not Whitelisted

Error: `not authorized on database`

**Solution:** Go to MongoDB Atlas → Network Access → Add your IP

---

## Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart web

# Enter container shell
docker exec -it docker-web-1 bash
```

---

## Production Deployment

For production, see [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)

Key differences for production:
1. Use strong passwords in `.env`
2. Set up SSL/HTTPS with a reverse proxy
3. Configure your domain's DNS
4. Set `MONGO_ALLOW_INVALID_CERTS=false`

---

## File Structure

```
Assignment-3/
├── .env                  # Your environment variables (DO NOT COMMIT)
├── .env.example          # Template for .env
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── Dockerfile.worker
└── htdocs/               # PHP application code
    ├── api/              # Backend API
    ├── js/               # Frontend JavaScript
    └── index.html        # Main entry point
```

---

**That's it! You're ready to go! 🎉**
