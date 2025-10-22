# Smart Student Monitoring System - Complete Setup Guide

A comprehensive guide to setting up the Smart Student Monitoring System with all advanced features including email notifications, geofencing, VPN detection, and AI-powered analytics.

## 🚀 Quick Overview

This system provides:
- **📧 Automated Parent Notifications** - Smart email alerts for attendance
- **🗺️ Geofencing & Location Validation** - GPS-based attendance verification
- **🛡️ VPN Detection & Security** - Advanced fraud prevention
- **🤖 AI-Powered Analytics** - Intelligent attendance insights
- **📱 Mobile-First Design** - Responsive QR code attendance
- **🌙 Dark/Light Theme Support** - Modern UI with theme switching

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **MySQL 8+**: You can either:
  - Install locally: Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
  - Use a cloud service: [PlanetScale](https://planetscale.com/), [Railway](https://railway.app/), or [Supabase](https://supabase.com/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TakudzwanasheSamuel/attendance-system.git
cd attendance-system
```

### 2. Install Dependencies

⚠️ **Important**: Due to peer dependency conflicts with `date-fns`, you must use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

This flag resolves conflicts between different versions of date-fns used by various packages.

### 3. Database Setup

#### Option A: Local MySQL Installation

1. **Install MySQL** (if not already installed):
   - Windows: Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
   - macOS: Use Homebrew: `brew install mysql`
   - Linux: `sudo apt-get install mysql-server` (Ubuntu/Debian)

2. **Start MySQL service**:
   - Windows: Start MySQL service from Services
   - macOS: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

3. **Create database**:
   ```sql
   mysql -u root -p
   CREATE DATABASE attendance_system;
   ```

#### Option B: Cloud Database (Recommended for beginners)

1. **PlanetScale** (Free tier available):
   - Sign up at [planetscale.com](https://planetscale.com/)
   - Create a new database
   - Copy the connection string

2. **Railway** (Free tier available):
   - Sign up at [railway.app](https://railway.app/)
   - Create a new MySQL database
   - Copy the connection string

### 4. Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your configuration:
   ```env
   # Database Configuration
   DATABASE_URL="mysql://username:password@localhost:3306/attendance_system"
   
   # JWT Secret for Authentication
   JWT_SECRET="your_jwt_secret_key_here"
   
   # Email Configuration (Optional - for parent notifications)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   
   # Google Gemini AI API Key (Optional)
   GOOGLE_GENAI_API_KEY="your_gemini_api_key_here"
   
   # VPN Detection API (Optional - for enhanced security)
   VPN_DETECTION_API_KEY="your_vpn_detection_api_key"
   ```

   **Database URL Examples**:
   - Local: `mysql://root:yourpassword@localhost:3306/attendance_system`
   - PlanetScale: `mysql://username:password@aws.connect.psdb.cloud/database_name?sslaccept=strict`
   - Railway: `mysql://username:password@containers-us-west-1.railway.app:port/railway`

### 5. Prisma Setup

1. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

2. **Push database schema**:
   ```bash
   npx prisma db push
   ```

   This creates all the necessary tables in your database.

### 6. Seed the Database

Populate your database with sample data:

```bash
npm run seed
```

This creates:
- 1 admin user
- 15 lecturer accounts
- 100 student accounts with parent contact information
- 20 courses with enrollments
- Sample attendance sessions and records
- Sample geofences for testing

**Default password for all users**: `password123`

### 7. Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:9002**

## Login Credentials

After seeding the database, you can log in with these accounts:

### Admin Account
- **Email**: `admin@msu.com`
- **Password**: `password123`
- **Access**: Full system control, user management, course management, geofence management, parent email management, system-wide reports

### Lecturer Account (Example)
- **Email**: `kudzai.moyo@msu.com` (or any lecturer email from the seeded data)
- **Password**: `password123`
- **Access**: Course management, attendance sessions, student reports, geofence creation

### Student Account (Example)
- **Email**: `tendekai.moyo.82@msu.com` (or any student email from the seeded data)
- **Password**: `password123`
- **Access**: Mark attendance, view personal history

## 📧 Email Notification System Setup

The system includes automated email notifications to parents/guardians about student attendance. This feature sends both positive updates (good attendance) and alerts (low attendance).

### Email Configuration

1. **Choose an email service** (Gmail recommended for beginners):
   - **Gmail**: Free, easy setup, reliable
   - **Outlook/Hotmail**: Good alternative
   - **Custom SMTP**: For advanced users

2. **Gmail Setup (Recommended)**:
   
   **Step 1: Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled
   
   **Step 2: Generate App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)
   
   **Step 3: Add to Environment Variables**
   ```env
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Other Email Services**:
   
   **Outlook/Hotmail**:
   ```env
   EMAIL_SERVICE=hotmail
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@outlook.com
   ```
   
   **Custom SMTP**:
   ```env
   EMAIL_SERVICE=smtp
   EMAIL_HOST=smtp.your-provider.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@domain.com
   EMAIL_PASSWORD=your-password
   EMAIL_FROM=your-email@domain.com
   ```

### Email Features

#### **Automatic Notifications**
- **Good Attendance (≥50%)**: Sends positive update emails with celebratory tone
- **Low Attendance (<50%)**: Sends alert emails with action items
- **Course-wise breakdown**: Shows attendance for each course
- **Professional templates**: HTML and plain text versions

#### **Manual Notifications**
- **Admin interface**: Send manual updates from `/admin/parent-emails`
- **Individual alerts**: Target specific students
- **Bulk operations**: Send to multiple parents

#### **Email Content**
- **Dynamic subjects**: Different for good vs. bad attendance
- **Personalized content**: Uses parent/student names
- **Course details**: Shows attendance for each enrolled course
- **Action items**: Provides guidance for parents

### Testing Email Setup

1. **Test email configuration**:
   ```bash
   # Visit this URL in your browser
   http://localhost:9002/api/email/test
   ```

2. **Check admin interface**:
   - Go to `/admin/parent-emails`
   - Click "Send Update" for any student with parent email
   - Verify email is received

## 🗺️ Geofencing System Setup

The system includes location-based attendance validation to ensure students are physically present at the correct venue.

### How Geofencing Works

#### **Core Concepts**
- **Geofence**: A virtual boundary around a specific location
- **Radius**: Distance from center point (default: 100 meters)
- **Validation**: Checks if student's location is within the geofence
- **Fallback**: Manual override for technical issues

#### **Location Data**
- **HTML5 Geolocation API**: Gets student's GPS coordinates
- **Haversine Formula**: Calculates distance between points
- **Privacy-focused**: No location data stored permanently

### Setting Up Geofences

#### **1. Admin Interface**
- Navigate to `/admin/geofences`
- Click "Create New Geofence"
- Fill in required information

#### **2. Getting Coordinates**

**Method 1: Use Current Location (Recommended)**
- Click "Use Current Location" button
- Allow browser location access
- **Note**: Requires HTTPS or localhost

**Method 2: Google Maps**
- Go to [Google Maps](https://maps.google.com)
- Search for your location
- Right-click on the exact spot
- Click the coordinates that appear
- Copy latitude and longitude

**Method 3: Coordinate Helper**
- Use the built-in coordinate helper in the admin interface
- Search for locations using Google Maps integration
- Copy coordinates from search results

#### **3. Geofence Configuration**

**Required Fields**:
- **Name**: Descriptive name (e.g., "Computer Lab 1")
- **Description**: Additional details
- **Latitude**: GPS latitude coordinate
- **Longitude**: GPS longitude coordinate
- **Radius**: Distance in meters (default: 100m)

**Example Configuration**:
```
Name: MSU Computer Lab 1
Description: Main computer laboratory building
Latitude: -19.0160
Longitude: 29.8579
Radius: 100
```

### Testing Geofencing

#### **1. Create Test Geofence**
- Set up a geofence at your current location
- Use a small radius (50-100 meters) for testing

#### **2. Test Attendance Marking**
- Create an attendance session with the geofence
- Try marking attendance from different locations
- Verify location validation works

#### **3. Troubleshooting**

**"Use Current Location" Not Working**:
- **HTTPS Required**: Use `https://` or `localhost`
- **Permission Denied**: Allow location access in browser
- **No GPS**: Use coordinate helper instead

**Location Validation Failing**:
- **Check coordinates**: Verify lat/lng are correct
- **Adjust radius**: Increase if too restrictive
- **Browser compatibility**: Try different browser

**Fallback Options**:
- **Manual override**: Admin can bypass location check
- **Coordinate helper**: Alternative way to get coordinates
- **Sample locations**: Pre-configured MSU locations

### Geofencing Best Practices

#### **Radius Guidelines**
- **Indoor venues**: 50-100 meters
- **Outdoor venues**: 100-200 meters
- **Large campuses**: 200-500 meters

#### **Privacy Considerations**
- **No storage**: Location data not permanently stored
- **User consent**: Clear permission requests
- **Fallback options**: Manual override available

#### **Technical Requirements**
- **HTTPS**: Required for geolocation API
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **GPS enabled**: For mobile devices

## 🛡️ VPN Detection & Security Features

The system includes advanced security features to prevent attendance fraud.

### VPN Detection

#### **How It Works**
- **IP Analysis**: Checks for known VPN/proxy IP ranges
- **User Agent Detection**: Identifies suspicious browser signatures
- **Confidence Scoring**: Provides reliability metrics
- **Configurable Blocking**: Can block or flag VPN usage

#### **Configuration**
```env
# Optional: VPN Detection API Key for enhanced detection
VPN_DETECTION_API_KEY="your_api_key_here"
```

#### **Security Levels**
- **Permissive**: Logs VPN usage but allows attendance
- **Strict**: Blocks attendance from detected VPNs
- **Custom**: Configurable rules per institution

### Additional Security Features

#### **Multi-Layer Validation**
- **Session Verification**: Validates active attendance sessions
- **Enrollment Check**: Ensures student is enrolled in course
- **Location Validation**: GPS-based presence verification
- **VPN Detection**: Prevents remote attendance marking

#### **Audit Trail**
- **IP Address Logging**: Records attendance source
- **User Agent Tracking**: Browser/device identification
- **Location Timestamps**: GPS verification records
- **Verification Notes**: Detailed validation results

## 🤖 AI-Powered Analytics Setup

The system includes AI-powered report generation using Google's Gemini AI.

### Google Gemini AI Setup

1. **Get a free API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Create a new API key

2. **Add to your `.env` file**:
   ```env
   GOOGLE_GENAI_API_KEY="your_actual_api_key_here"
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

**Note**: If you don't set up the API key, the system will still work with fallback reports that don't include AI analysis.

### AI Features

#### **Smart Report Generation**
- **Attendance Analysis**: Identifies patterns and trends
- **Risk Assessment**: Flags students with concerning attendance
- **Predictive Insights**: Forecasts potential issues
- **Actionable Recommendations**: Suggests interventions

#### **Natural Language Reports**
- **Executive Summaries**: High-level attendance overviews
- **Detailed Analysis**: Course-specific insights
- **Trend Identification**: Historical pattern analysis
- **Recommendation Engine**: Automated suggestions

## 🌙 Theme System

The system includes a modern dark/light theme switcher.

### Theme Features

#### **Automatic Detection**
- **System Preference**: Follows OS theme setting
- **Manual Override**: User can force light/dark mode
- **Persistent Choice**: Remembers user preference
- **Smooth Transitions**: Animated theme switching

#### **Theme Components**
- **Dark Mode**: Professional dark interface
- **Light Mode**: Clean, bright interface
- **High Contrast**: Accessibility-friendly options
- **Custom Colors**: Institution branding support

## 📱 Mobile Optimization

The system is fully optimized for mobile devices.

### Mobile Features

#### **Responsive Design**
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile Navigation**: Optimized sidebar and menus
- **QR Code Scanning**: Native camera integration
- **Location Services**: GPS-based attendance marking

#### **Progressive Web App**
- **Offline Support**: Basic functionality without internet
- **App Installation**: Can be installed as native app
- **Push Notifications**: Real-time attendance alerts
- **Background Sync**: Automatic data synchronization

## Troubleshooting

### Common Issues and Solutions

#### 1. Dependency Installation Errors

**Error**: `ERESOLVE could not resolve` or peer dependency conflicts

**Solution**: Always use the legacy peer deps flag:
```bash
npm install --legacy-peer-deps
```

#### 2. Database Connection Errors

**Error**: `Can't reach database server`

**Solutions**:
- Verify MySQL is running: `mysql -u root -p`
- Check your `DATABASE_URL` in `.env`
- Ensure database exists: `CREATE DATABASE attendance_system;`
- For cloud databases, verify connection string format

#### 3. Prisma Errors

**Error**: `PrismaClientValidationError: Argument 'id' is missing`

**Solution**: This is already fixed in the codebase. If you encounter this:
```bash
npx prisma generate
npx prisma db push
```

#### 4. Port Already in Use

**Error**: `Port 9002 is already in use`

**Solution**: Either:
- Stop the process using port 9002
- Change the port in `package.json`: `"dev": "next dev --turbopack -p 9003"`

#### 5. AI Reports Not Working

**Error**: `API key not valid` or AI reports showing fallback content

**Solutions**:
- Verify your `GOOGLE_GENAI_API_KEY` in `.env`
- Check API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure you've restarted the server after adding the key

#### 6. Email Notifications Not Working

**Error**: `Failed to send email` or emails not being received

**Solutions**:
- **Gmail App Password**: Ensure you're using an app password, not your regular password
- **2FA Required**: Enable 2-factor authentication before generating app password
- **Check credentials**: Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- **Test email**: Visit `/api/email/test` to verify configuration
- **Check spam folder**: Emails might be filtered as spam
- **Rate limits**: Gmail has sending limits (500 emails/day for free accounts)

**Common Gmail Issues**:
- **"Less secure app access"**: Use app passwords instead
- **"Invalid credentials"**: Regenerate app password
- **"Authentication failed"**: Check 2FA is enabled

#### 7. Geofencing Not Working

**Error**: `Use Current Location` button not responding

**Solutions**:
- **HTTPS Required**: Use `https://` or `localhost` (not `http://` on external domains)
- **Browser permissions**: Allow location access when prompted
- **GPS enabled**: Ensure device GPS is enabled for mobile
- **Fallback method**: Use coordinate helper or manual entry

**Error**: Location validation always failing

**Solutions**:
- **Check coordinates**: Verify latitude/longitude are correct
- **Adjust radius**: Increase geofence radius if too restrictive
- **Test location**: Use coordinate helper to verify your current location
- **Browser compatibility**: Try different browser (Chrome recommended)

**Error**: "Geolocation not supported"

**Solutions**:
- **Modern browser**: Use Chrome, Firefox, Safari, or Edge
- **HTTPS**: Ensure secure connection
- **Mobile device**: Use device with GPS capability

#### 8. VPN Detection Issues

**Error**: VPN detection not working or false positives

**Solutions**:
- **API Key**: Verify VPN detection API key is valid
- **Network Configuration**: Check if behind corporate firewall
- **False Positives**: Adjust detection sensitivity
- **Fallback Mode**: System works without VPN detection

#### 9. Theme Issues

**Error**: Theme not switching or colors not updating

**Solutions**:
- **Browser Cache**: Clear browser cache and reload
- **JavaScript**: Ensure JavaScript is enabled
- **Local Storage**: Check if local storage is available
- **CSS Loading**: Verify all CSS files are loading

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**: Look at the terminal output for error messages
2. **Verify prerequisites**: Ensure Node.js, MySQL, and Git are properly installed
3. **Database connection**: Test your database connection independently
4. **Environment variables**: Double-check your `.env` file format
5. **GitHub Issues**: Create an issue in the repository with detailed error information

## Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Seed database
npm run seed

# Prisma commands
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema to database
npx prisma studio      # Open Prisma Studio (database GUI)

# Utility scripts
node scripts/list-users.js        # List all users in database
node scripts/test-geofencing.js   # Test geofencing functionality
```

## Project Structure

```
attendance-system/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── geofences/   # Geofence management
│   │   │   └── parent-emails/ # Parent email management
│   │   ├── api/             # API routes
│   │   │   ├── attendance/  # Attendance endpoints
│   │   │   ├── email/       # Email testing
│   │   │   ├── geofences/   # Geofence management
│   │   │   └── scheduler/   # Scheduled jobs
│   │   ├── attendance/      # Student attendance pages
│   │   └── test-geofencing/ # Geofencing test page
│   ├── components/          # React components
│   │   ├── admin/           # Admin-specific components
│   │   │   ├── geofence-management.tsx
│   │   │   ├── parent-email-management.tsx
│   │   │   └── coordinate-helper.tsx
│   │   ├── shared/          # Shared components
│   │   │   ├── countdown-timer.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   └── student/         # Student-specific components
│   │       └── location-aware-attendance-form.tsx
│   ├── lib/                 # Utility functions and configurations
│   │   ├── email-service.ts # Email notification system
│   │   ├── attendance-checker.ts # Attendance calculation
│   │   ├── scheduler.ts     # Scheduled job management
│   │   ├── geofencing.ts    # Location validation
│   │   ├── vpn-detection.ts # VPN detection system
│   │   └── geo-utils.ts     # Geographic utilities
│   └── ai/                  # AI integration (Genkit)
├── prisma/
│   └── schema.prisma        # Database schema
├── scripts/
│   ├── seed-database.js     # Database seeding script
│   ├── list-users.js        # User listing utility
│   └── test-geofencing.js   # Geofencing test script
├── public/                  # Static assets
├── docs/                    # Documentation
├── EMAIL-SETUP.md          # Email configuration guide
├── GEOFENCING-IMPLEMENTATION.md # Geofencing documentation
└── GEOFENCING-DEMO.md      # Geofencing demo guide
```

## Next Steps

Once you have the system running:

1. **Explore the interface**: Log in as different user types to understand the system
2. **Set up email notifications**: Configure Gmail app password for parent notifications
3. **Create geofences**: Set up location boundaries for attendance validation
4. **Test VPN detection**: Verify security features are working
5. **Configure themes**: Customize the appearance for your institution
6. **Create test data**: Add courses, enroll students, create attendance sessions
7. **Test attendance marking**: Use the QR code system with geofencing validation
8. **Test email system**: Send test emails to verify parent notifications work
9. **Generate AI reports**: Try the AI-powered reporting features
10. **Mobile testing**: Test on mobile devices for responsive design
11. **Customize**: Modify the system to fit your specific needs

### Key Features to Test

#### **Email System**
- **Parent notifications**: Test both good and bad attendance emails
- **Manual alerts**: Use admin interface to send individual updates
- **Email templates**: Verify HTML and plain text versions work
- **Scheduled notifications**: Test automated email triggers

#### **Geofencing**
- **Location validation**: Test attendance marking from different locations
- **Coordinate helper**: Practice getting coordinates for new venues
- **Fallback options**: Test manual override when location fails
- **Mobile GPS**: Test on mobile devices with GPS

#### **Security Features**
- **VPN detection**: Test with and without VPN connections
- **Multi-layer validation**: Verify all security checks work
- **Audit trail**: Check that all actions are logged
- **Access control**: Test role-based permissions

#### **Real-time Features**
- **Countdown timers**: Verify session time remaining displays correctly
- **Live attendance**: Check real-time attendance updates
- **Session management**: Test creating and managing attendance sessions
- **Theme switching**: Test dark/light mode functionality

#### **AI Features**
- **Report generation**: Test AI-powered attendance analysis
- **Trend detection**: Verify pattern recognition works
- **Recommendations**: Check automated suggestions
- **Natural language**: Test report readability

## Production Deployment

### Environment Setup

For production deployment, ensure you have:

1. **Production Database**: Use a managed MySQL service
2. **Environment Variables**: Set all required production values
3. **Email Service**: Configure production email provider
4. **SSL Certificate**: Enable HTTPS for geolocation features
5. **Domain Configuration**: Set up proper domain and DNS

### Security Considerations

1. **JWT Secret**: Use a strong, unique JWT secret
2. **Database Security**: Use connection pooling and SSL
3. **Email Security**: Use app passwords, not regular passwords
4. **API Keys**: Store all API keys securely
5. **Access Control**: Implement proper user permissions

### Performance Optimization

1. **Database Indexing**: Ensure proper database indexes
2. **Caching**: Implement Redis for session caching
3. **CDN**: Use CDN for static assets
4. **Monitoring**: Set up application monitoring
5. **Backup**: Implement regular database backups

## Support

For additional help or to report issues:

1. **Documentation**: Check all documentation files in the `docs/` folder
2. **GitHub Issues**: Create an issue in the repository
3. **Email Support**: Contact support@msu.com
4. **Community**: Join the discussion in GitHub discussions

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ for Midlands State University**

**Happy coding! 🚀**
