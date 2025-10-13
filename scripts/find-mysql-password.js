const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Finding MySQL Root Password\n');

const commonPasswords = [
  '', // No password
  'root',
  'mysql',
  'password',
  'admin',
  '123456',
  'password123'
];

console.log('Testing common MySQL root passwords...\n');

let workingPassword = null;

for (const pwd of commonPasswords) {
  try {
    const passwordArg = pwd ? `-p${pwd}` : '';
    const command = `mysql -u root ${passwordArg} -e "SELECT 'Connection successful' as status;"`;
    
    console.log(`Testing: ${pwd || '(no password)'}`);
    
    const result = execSync(command, { 
      stdio: 'pipe',
      timeout: 5000 
    });
    
    console.log(`✅ SUCCESS! Password is: "${pwd || '(empty)'}"\n`);
    workingPassword = pwd;
    break;
    
  } catch (error) {
    console.log(`❌ Failed: ${pwd || '(no password)'}`);
  }
}

if (workingPassword !== null) {
  // Update .env file with correct password
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const databaseUrl = workingPassword 
    ? `mysql://root:${workingPassword}@localhost:3306/attendance_system`
    : `mysql://root@localhost:3306/attendance_system`;
  
  envContent = envContent.replace(
    /DATABASE_URL="[^"]+"/,
    `DATABASE_URL="${databaseUrl}"`
  );
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Updated .env with correct password');
  console.log(`📋 DATABASE_URL: ${databaseUrl}\n`);
  
  // Create database
  try {
    const passwordArg = workingPassword ? `-p${workingPassword}` : '';
    const createDbCommand = `mysql -u root ${passwordArg} -e "CREATE DATABASE IF NOT EXISTS attendance_system;"`;
    execSync(createDbCommand, { stdio: 'pipe' });
    console.log('✅ Database "attendance_system" created successfully\n');
  } catch (error) {
    console.log('⚠️  Database may already exist or creation failed\n');
  }
  
  console.log('🚀 Ready to continue! Run these commands:');
  console.log('   npx prisma generate');
  console.log('   npx prisma db push');
  console.log('   npm run seed');
  
} else {
  console.log('\n❌ Could not find working password automatically');
  console.log('\n💡 Manual steps:');
  console.log('1. Try: mysql -u root -p (enter password when prompted)');
  console.log('2. If successful, update DATABASE_URL in .env file');
  console.log('3. Or reset MySQL password if forgotten');
}
