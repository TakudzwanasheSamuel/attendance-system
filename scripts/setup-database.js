const fs = require('fs');
const path = require('path');

console.log('🔧 Database Setup Helper\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Please run: cp env.example .env');
  process.exit(1);
}

// Read current .env
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('📋 Current DATABASE_URL configuration:');

const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) {
  console.log(`   ${dbUrlMatch[1]}\n`);
} else {
  console.log('   DATABASE_URL not found in .env file\n');
}

console.log('🔍 Common Database Configuration Issues:\n');

console.log('1. **MySQL Authentication Error**');
console.log('   - Check if MySQL is running: `mysql --version`');
console.log('   - Verify credentials: `mysql -u root -p`');
console.log('   - Update DATABASE_URL in .env file\n');

console.log('2. **Common DATABASE_URL Formats:**');
console.log('   - No password: mysql://root@localhost:3306/attendance_system');
console.log('   - With password: mysql://root:password@localhost:3306/attendance_system');
console.log('   - Different user: mysql://username:password@localhost:3306/attendance_system\n');

console.log('3. **SQLite Alternative (for development):**');
console.log('   - Change DATABASE_URL to: file:./dev.db');
console.log('   - No MySQL server required\n');

console.log('4. **Create Database:**');
console.log('   - MySQL: CREATE DATABASE attendance_system;');
console.log('   - Or run: mysql -u root -p -e "CREATE DATABASE attendance_system;"\n');

console.log('🛠️  **Next Steps:**');
console.log('1. Fix DATABASE_URL in .env file');
console.log('2. Ensure database exists');
console.log('3. Run: npx prisma db push');
console.log('4. Run: npm run seed');

// Test database connection
console.log('\n🧪 Testing database connection...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful!');
      prisma.$disconnect();
    })
    .catch((error) => {
      console.log('❌ Database connection failed:');
      console.log(`   ${error.message}`);
      
      if (error.message.includes('Authentication failed')) {
        console.log('\n💡 Solution: Update your DATABASE_URL with correct credentials');
      } else if (error.message.includes('Unknown database')) {
        console.log('\n💡 Solution: Create the database first');
      }
    });
} catch (error) {
  console.log('⚠️  Could not test connection - Prisma client not available');
}
