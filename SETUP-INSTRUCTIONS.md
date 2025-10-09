# Smart Student Monitoring System - Setup Instructions

This guide will walk you through setting up the Smart Student Monitoring System from scratch. Follow these steps carefully to get the application running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

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

2. **Edit the `.env` file** with your database credentials:
   ```env
   # Database Configuration
   DATABASE_URL="mysql://username:password@localhost:3306/attendance_system"
   
   # Google Gemini AI API Key (Optional)
   GOOGLE_GENAI_API_KEY="your_gemini_api_key_here"
   
   # JWT Secret for Authentication
   JWT_SECRET="your_jwt_secret_key_here"
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
- 100 student accounts
- 20 courses with enrollments
- Sample attendance sessions and records

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
- **Access**: Full system control, user management, course management, system-wide reports

### Lecturer Account (Example)
- **Email**: `kudzai.moyo@msu.com` (or any lecturer email from the seeded data)
- **Password**: `password123`
- **Access**: Course management, attendance sessions, student reports

### Student Account (Example)
- **Email**: `tendekai.moyo.82@msu.com` (or any student email from the seeded data)
- **Password**: `password123`
- **Access**: Mark attendance, view personal history

## Optional: Google Gemini AI Setup

The system includes AI-powered report generation. To enable this feature:

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

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**: Look at the terminal output for error messages
2. **Verify prerequisites**: Ensure Node.js, MySQL, and Git are properly installed
3. **Database connection**: Test your database connection independently
4. **Environment variables**: Double-check your `.env` file format

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
```

## Project Structure

```
attendance-system/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and configurations
│   └── ai/                  # AI integration (Genkit)
├── prisma/
│   └── schema.prisma        # Database schema
├── scripts/
│   └── seed-database.js     # Database seeding script
├── public/                  # Static assets
└── docs/                    # Documentation
```

## Next Steps

Once you have the system running:

1. **Explore the interface**: Log in as different user types to understand the system
2. **Create test data**: Add courses, enroll students, create attendance sessions
3. **Test attendance marking**: Use the QR code system or manual entry
4. **Generate reports**: Try the AI-powered reporting features
5. **Customize**: Modify the system to fit your specific needs

## Support

For additional help or to report issues, please refer to the main [README.md](./README.md) or create an issue in the GitHub repository.

---

**Happy coding! 🚀**
