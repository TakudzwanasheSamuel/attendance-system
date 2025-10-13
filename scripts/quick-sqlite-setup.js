const fs = require('fs');
const path = require('path');

console.log('🚀 Quick SQLite Setup for Development\n');

// Backup current .env
const envPath = path.join(process.cwd(), '.env');
const backupPath = path.join(process.cwd(), '.env.mysql.backup');

if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, backupPath);
  console.log('📋 Backed up current .env to .env.mysql.backup');
}

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace DATABASE_URL with SQLite
envContent = envContent.replace(
  /DATABASE_URL="[^"]+"/,
  'DATABASE_URL="file:./dev.db"'
);

// Write updated .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Updated .env to use SQLite');
console.log('📁 Database file will be: ./dev.db');
console.log('\n🔄 Now run:');
console.log('   npx prisma db push');
console.log('   npm run seed');
console.log('\n💡 To switch back to MySQL later:');
console.log('   cp .env.mysql.backup .env');
