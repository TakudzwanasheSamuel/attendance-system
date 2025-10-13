const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MySQL Password Configuration\n');
console.log('You successfully connected to MySQL earlier with: mysql -u root -p');
console.log('Please enter the same password you used:\n');

rl.question('Enter your MySQL root password: ', (password) => {
  console.log('\n🔄 Updating .env file...');
  
  // Update .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const databaseUrl = password 
    ? `mysql://root:${password}@localhost:3306/attendance_system`
    : `mysql://root@localhost:3306/attendance_system`;
  
  envContent = envContent.replace(
    /DATABASE_URL="[^"]+"/,
    `DATABASE_URL="${databaseUrl}"`
  );
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Updated .env file');
  console.log(`📋 DATABASE_URL: ${databaseUrl}\n`);
  
  // Test the connection
  const { execSync } = require('child_process');
  try {
    const passwordArg = password ? `-p${password}` : '';
    const testCommand = `mysql -u root ${passwordArg} -e "SELECT 'Connection successful' as status;"`;
    
    execSync(testCommand, { stdio: 'pipe' });
    console.log('✅ MySQL connection test successful!\n');
    
    // Create database
    try {
      const createDbCommand = `mysql -u root ${passwordArg} -e "CREATE DATABASE IF NOT EXISTS attendance_system;"`;
      execSync(createDbCommand, { stdio: 'pipe' });
      console.log('✅ Database "attendance_system" ready\n');
    } catch (error) {
      console.log('⚠️  Database creation failed, but may already exist\n');
    }
    
    console.log('🚀 Ready to continue! Run:');
    console.log('   npx prisma generate');
    console.log('   npx prisma db push');
    console.log('   npm run seed');
    
  } catch (error) {
    console.log('❌ Connection test failed. Please check your password.');
  }
  
  rl.close();
});
