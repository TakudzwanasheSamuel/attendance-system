# 📧 Email Service Setup Guide

## 🔧 **Environment Variables**

Add these variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=attendance@msu.ac.zw

# Attendance Thresholds
ATTENDANCE_THRESHOLD=50
```

## 📱 **Gmail Setup (Recommended)**

### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled

### **Step 2: Generate App Password**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "App passwords" under "Signing in to Google"
3. Select "Mail" and "Other (custom name)"
4. Enter "MSU Attendance System" as the name
5. Copy the generated 16-character password
6. Use this password in `EMAIL_PASSWORD`

### **Step 3: Configure Environment**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-gmail@gmail.com
```

## 🏢 **Alternative Email Services**

### **SendGrid (Professional)**
```bash
npm install @sendgrid/mail
```

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=attendance@msu.ac.zw
```

### **Resend (Modern)**
```bash
npm install resend
```

```env
EMAIL_SERVICE=resend
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=attendance@msu.ac.zw
```

## 🧪 **Testing Email Service**

### **Method 1: Admin Interface**
1. Login as admin
2. Go to `/admin/parent-emails`
3. Click "Test Email"
4. Enter your email address
5. Check for test email

### **Method 2: API Endpoint**
```bash
curl -X POST http://localhost:9002/api/email/test \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=your-admin-token" \
  -d '{"email":"test@example.com"}'
```

### **Method 3: Manual Test**
```javascript
import { emailService } from '@/lib/email-service';

// Test connection
await emailService.testConnection();

// Send test email
await emailService.sendTestEmail('test@example.com');
```

## 📊 **Email Templates**

The system includes professional HTML email templates with:
- **MSU Branding**: University colors and logo
- **Responsive Design**: Works on mobile and desktop
- **Course Details**: Individual course attendance breakdown
- **Action Items**: Clear next steps for parents
- **Contact Information**: University contact details

## 🔄 **Automated Scheduling**

### **Daily Attendance Check**
- **Time**: 6:00 PM daily
- **Action**: Checks all students with parent emails
- **Threshold**: Sends alerts for attendance below 50%
- **Manual Trigger**: Available in admin interface

### **Manual Triggers**
- **Individual Student**: Check specific student
- **Course-based**: Check all students in a course
- **Bulk Check**: Check all students at once

## 🛡️ **Security Considerations**

### **Email Security**
- Use app passwords, not regular passwords
- Enable 2FA on email accounts
- Use dedicated email accounts for system emails
- Monitor email sending limits

### **Data Privacy**
- Parent emails are stored securely in database
- Emails only sent to verified parent addresses
- No student data shared beyond attendance information
- Compliance with data protection regulations

## 📈 **Monitoring & Analytics**

### **Email Statistics**
- Total emails sent
- Delivery success rate
- Bounce rate
- Parent engagement metrics

### **Attendance Metrics**
- Students with parent emails
- Low attendance alerts sent
- Attendance improvement tracking
- Course-wise attendance trends

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Email service connection failed"**
- Check EMAIL_USER and EMAIL_PASSWORD
- Verify app password is correct
- Ensure 2FA is enabled

#### **"Failed to send test email"**
- Check internet connection
- Verify email address format
- Check Gmail sending limits

#### **"No parent emails configured"**
- Add parent emails in admin interface
- Verify parent email addresses
- Check database connection

### **Debug Mode**
```env
DEBUG_EMAIL=true
```

This will log detailed email sending information to the console.

## 📞 **Support**

For email service issues:
- Check the console logs for detailed error messages
- Verify environment variables are set correctly
- Test with a simple email first
- Contact system administrator if issues persist

## 🎯 **Best Practices**

1. **Test Regularly**: Send test emails to verify service
2. **Monitor Limits**: Watch Gmail sending limits (500/day for free)
3. **Backup Emails**: Keep backup parent email addresses
4. **Update Templates**: Customize email templates for your needs
5. **Track Metrics**: Monitor email delivery and engagement
