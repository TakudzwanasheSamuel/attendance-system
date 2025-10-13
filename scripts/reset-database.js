const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Resetting Database for Clean Setup\n');

// Get password from command line or prompt user
const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/reset-database.js YOUR_MYSQL_PASSWORD\n');
  console.log('This script will:');
  console.log('1. Drop and recreate the attendance_system database');
  console.log('2. Update .env file with correct MySQL URL');
  console.log('3. Run prisma db push to create fresh schema');
  console.log('4. Seed with demo data\n');
  console.log('Example: node scripts/reset-database.js mypassword123');
  process.exit(1);
}

try {
  console.log('1️⃣ Testing MySQL connection...');
  const testCommand = `mysql -u root -p${password} -e "SELECT 1;"`;
  execSync(testCommand, { stdio: 'pipe' });
  console.log('✅ MySQL connection successful\n');

  console.log('2️⃣ Dropping and recreating database...');
  const resetDbCommands = [
    `mysql -u root -p${password} -e "DROP DATABASE IF EXISTS attendance_system;"`,
    `mysql -u root -p${password} -e "CREATE DATABASE attendance_system;"`
  ];
  
  for (const cmd of resetDbCommands) {
    execSync(cmd, { stdio: 'pipe' });
  }
  console.log('✅ Database reset complete\n');

  console.log('3️⃣ Updating .env file...');
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const databaseUrl = `mysql://root:${password}@localhost:3306/attendance_system`;
  envContent = envContent.replace(
    /DATABASE_URL="[^"]+"/,
    `DATABASE_URL="${databaseUrl}"`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated\n');

  console.log('4️⃣ Cleaning Prisma cache...');
  try {
    execSync('rmdir /s /q node_modules\\.prisma', { stdio: 'pipe' });
  } catch (error) {
    // Ignore if directory doesn't exist
  }
  console.log('✅ Prisma cache cleared\n');

  console.log('5️⃣ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  console.log('6️⃣ Creating database schema...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('✅ Database schema created\n');

  console.log('7️⃣ Seeding database with demo data...');
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded\n');

  console.log('🎉 DATABASE RESET COMPLETE!\n');
  console.log('📋 Ready to use:');
  console.log('   Database: attendance_system');
  console.log('   Demo users: 117 users created');
  console.log('   Demo courses: 20 courses created');
  console.log('   MSU Gweru geofencing: Configured\n');

  console.log('👥 Demo Accounts:');
  console.log('   Admin: admin@msu.com / password123');
  console.log('   Student: tinashe.mazvihwa.40@msu.com / password123');
  console.log('   Lecturer: blessing.moyo.12@msu.com / password123\n');

  console.log('🚀 Start the application:');
  console.log('   npm run dev');

} catch (error) {
  console.log('❌ Reset failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Ensure MySQL is running');
  console.log('2. Check if the password is correct');
  console.log('3. Try manual reset:');
  console.log('   mysql -u root -p');
  console.log('   DROP DATABASE IF EXISTS attendance_system;');
  console.log('   CREATE DATABASE attendance_system;');
  console.log('   EXIT;');
  process.exit(1);
}
