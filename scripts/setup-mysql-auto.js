const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('🔧 MySQL Auto Setup Script\n');
  console.log('Usage: node scripts/setup-mysql-auto.js YOUR_PASSWORD\n');
  console.log('Example: node scripts/setup-mysql-auto.js mypassword123\n');
  console.log('💡 Use the same password you used with: mysql -u root -p');
  process.exit(1);
}

console.log('🚀 Setting up MySQL configuration automatically...\n');

try {
  // Step 1: Test MySQL connection
  console.log('1️⃣ Testing MySQL connection...');
  const testCommand = `mysql -u root -p${password} -e "SELECT 'Connection successful' as status;"`;
  execSync(testCommand, { stdio: 'pipe' });
  console.log('✅ MySQL connection successful!\n');

  // Step 2: Create database
  console.log('2️⃣ Creating database...');
  const createDbCommand = `mysql -u root -p${password} -e "CREATE DATABASE IF NOT EXISTS attendance_system;"`;
  execSync(createDbCommand, { stdio: 'pipe' });
  console.log('✅ Database "attendance_system" created/verified\n');

  // Step 3: Update .env file
  console.log('3️⃣ Updating .env file...');
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const databaseUrl = `mysql://root:${password}@localhost:3306/attendance_system`;
  envContent = envContent.replace(
    /DATABASE_URL="[^"]+"/,
    `DATABASE_URL="${databaseUrl}"`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated with MySQL configuration\n');

  // Step 4: Generate Prisma client
  console.log('4️⃣ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Step 5: Push database schema
  console.log('5️⃣ Creating database tables...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema created\n');

  // Step 6: Seed database
  console.log('6️⃣ Seeding database with demo data...');
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded with demo data\n');

  console.log('🎉 SETUP COMPLETE!\n');
  console.log('📋 Configuration Summary:');
  console.log(`   Database URL: ${databaseUrl}`);
  console.log('   Demo data: 117 users, 20 courses, sample sessions');
  console.log('   MSU Gweru geofencing: Configured\n');

  console.log('🚀 Start the application:');
  console.log('   npm run dev\n');

  console.log('👥 Demo accounts:');
  console.log('   Admin: admin@msu.com / password123');
  console.log('   Student: tinashe.mazvihwa.40@msu.com / password123');
  console.log('   Lecturer: blessing.moyo.12@msu.com / password123');

} catch (error) {
  console.log('❌ Setup failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check if MySQL is running');
  console.log('2. Verify the password is correct');
  console.log('3. Try: mysql -u root -p (to test manually)');
  process.exit(1);
}
