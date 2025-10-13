# Deployment Guide

This guide covers deploying the Smart Student Monitoring System to production environments.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)
- **Best for:** Quick deployment with minimal configuration
- **Database:** Use PlanetScale or Supabase
- **Estimated time:** 15 minutes

### Option 2: Railway
- **Best for:** Full-stack deployment with database included
- **Database:** PostgreSQL included
- **Estimated time:** 20 minutes

### Option 3: Self-hosted
- **Best for:** Full control and customization
- **Database:** Your choice (MySQL, PostgreSQL)
- **Estimated time:** 1-2 hours

## 📋 Pre-deployment Checklist

### ✅ Code Preparation
- [ ] All tests passing (`npm test`)
- [ ] No console.log statements in production code
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Build successful (`npm run build`)

### ✅ Environment Setup
- [ ] Production database ready
- [ ] JWT_SECRET configured (strong, unique)
- [ ] Database URL configured
- [ ] All required environment variables set

### ✅ Security Review
- [ ] HTTPS enabled
- [ ] Secure cookie settings
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation in place

## 🌐 Vercel Deployment

### Step 1: Prepare Your Repository
```bash
# Ensure your code is committed and pushed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Database Setup
Choose a database provider:

#### Option A: PlanetScale (MySQL)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create new database
3. Get connection string
4. Update `DATABASE_URL` in environment variables

#### Option B: Supabase (PostgreSQL)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `DATABASE_URL` and switch to PostgreSQL in schema

### Step 3: Deploy to Vercel
1. Visit [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Configure environment variables:
   ```
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_strong_jwt_secret_here
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
4. Deploy!

### Step 4: Post-deployment Setup
```bash
# Run database migrations (if using Vercel CLI)
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

## 🚂 Railway Deployment

### Step 1: Setup Railway
1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository

### Step 2: Add Database
1. Add PostgreSQL service to your project
2. Railway will provide `DATABASE_URL` automatically

### Step 3: Configure Environment Variables
```
JWT_SECRET=your_strong_jwt_secret_here
NODE_ENV=production
```

### Step 4: Deploy
Railway will automatically deploy when you push to your main branch.

## 🏠 Self-hosted Deployment

### Server Requirements
- **OS:** Ubuntu 20.04+ or similar
- **Node.js:** 18+
- **Database:** MySQL 8+ or PostgreSQL 13+
- **Memory:** 2GB+ RAM
- **Storage:** 10GB+ available space

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

### Step 2: Database Setup
```bash
# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE attendance_system;
CREATE USER 'attendance_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON attendance_system.* TO 'attendance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Application Deployment
```bash
# Clone repository
git clone https://github.com/TakudzwanasheSamuel/attendance-system.git
cd attendance-system

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Build application
npm run build

# Setup database
npx prisma db push
npm run seed

# Start with PM2
pm2 start npm --name "attendance-system" -- start
pm2 startup
pm2 save
```

### Step 4: Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/attendance-system
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/attendance-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/attendance_system"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"

# Application
NODE_ENV="production"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Optional Variables
```env
# VPN Detection (optional)
IPQUALITYSCORE_API_KEY="your-api-key"

# Google Gemini AI (optional)
GOOGLE_GENAI_API_KEY="your-google-ai-key"

# Monitoring (optional)
SENTRY_DSN="your-sentry-dsn"
```

## 📊 Monitoring & Maintenance

### Health Checks
Set up monitoring for:
- Application uptime
- Database connectivity
- API response times
- Error rates

### Automated Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u attendance_user -p attendance_system > backup_$DATE.sql
```

### Log Management
```bash
# View application logs
pm2 logs attendance-system

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Updates
```bash
# Update application
cd /path/to/attendance-system
git pull origin main
npm install
npm run build
pm2 restart attendance-system
```

## 🔒 Security Considerations

### Production Security Checklist
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong JWT secret (32+ characters)
- [ ] Database credentials secured
- [ ] Server firewall configured
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

### Firewall Configuration
```bash
# UFW firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/attendance-system
```

### Performance Optimization
- Enable gzip compression in Nginx
- Set up CDN for static assets
- Implement database connection pooling
- Configure proper caching headers

## 📞 Support

### Deployment Issues
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review Nginx configuration

### Performance Issues
1. Monitor resource usage
2. Check database query performance
3. Review application metrics
4. Optimize slow endpoints

---

**Deployment completed successfully!** 🎉

Your attendance system is now live and ready for production use.
