const fs = require('fs');
const path = require('path');

console.log('🔧 Restoring MySQL Configuration\n');

// Read current .env
const envPath = path.join(process.cwd(), '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current DATABASE_URL:');
const currentUrl = envContent.match(/DATABASE_URL="([^"]+)"/);
if (currentUrl) {
  console.log(`   ${currentUrl[1]}\n`);
}

// Replace SQLite URL with MySQL URL
envContent = envContent.replace(
  /DATABASE_URL="[^"]+"/,
  'DATABASE_URL="mysql://root:password@localhost:3306/attendance_system"'
);

// Write updated .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env to use MySQL');
console.log('📋 New DATABASE_URL: mysql://root:password@localhost:3306/attendance_system\n');

console.log('🔧 Next steps:');
console.log('1. Update the password in .env if needed');
console.log('2. Create database: mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS attendance_system;"');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma db push');
console.log('5. Run: npm run seed\n');

// Test if we can connect to MySQL
console.log('🧪 Testing MySQL connection...');
try {
  const { execSync } = require('child_process');
  
  // Test MySQL connection with the password "password"
  try {
    execSync('mysql -u root -ppassword -e "SELECT 1;"', { stdio: 'pipe' });
    console.log('✅ MySQL connection successful with password "password"');
  } catch (error) {
    console.log('❌ MySQL connection failed with password "password"');
    console.log('💡 You may need to update the password in .env file');
  }
} catch (error) {
  console.log('⚠️  Could not test MySQL connection automatically');
}
