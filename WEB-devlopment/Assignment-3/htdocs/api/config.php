<?php
/**
 * Production Configuration
 * 
 * UPDATE THESE VALUES WITH YOUR ACTUAL MONGODB ATLAS CREDENTIALS!
 */

// MongoDB Atlas - CHANGE THESE!
putenv('MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@ac-pnazizw-shard-00-00.ypjp051.mongodb.net/?retryWrites=true&w=majority');
putenv('MONGO_DB=nexus_vault');
putenv('MONGO_ALLOW_INVALID_CERTS=true');

// RabbitMQ (optional)
putenv('RABBITMQ_HOST=localhost');
putenv('RABBITMQ_PORT=5672');
putenv('RABBITMQ_USER=admin');
putenv('RABBITMQ_PASS=admin123');

// SMTP Email
putenv('SMTP_HOST=smtp.gmail.com');
putenv('SMTP_PORT=587');
putenv('SMTP_USER=your-email@gmail.com');
putenv('SMTP_PASS=your-app-password');
putenv('SMTP_FROM_EMAIL=your-email@gmail.com');
putenv('SMTP_FROM_NAME=Nexus Vault');
