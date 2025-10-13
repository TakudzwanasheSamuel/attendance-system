const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getUsers() {
  try {
    console.log('🔍 Fetching all users from database...\n');
    
    const users = await prisma.user.findMany({
      select: {
        role: true,
        email: true,
        name: true
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log('📊 USER LOGIN CREDENTIALS');
    console.log('=' .repeat(50));
    console.log('🔐 Default Password: password123\n');

    // Group by role
    const adminUsers = users.filter(u => u.role === 'ADMIN');
    const lecturerUsers = users.filter(u => u.role === 'LECTURER');
    const studentUsers = users.filter(u => u.role === 'STUDENT');

    // Admin users
    if (adminUsers.length > 0) {
      console.log('🔑 ADMIN ACCOUNTS');
      console.log('-'.repeat(30));
      adminUsers.forEach(user => {
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);
        console.log(`Password: password123\n`);
      });
    }

    // Lecturer users
    if (lecturerUsers.length > 0) {
      console.log('👨‍🏫 LECTURER ACCOUNTS');
      console.log('-'.repeat(30));
      lecturerUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Password: password123\n`);
      });
    }

    // Student users (show first 10)
    if (studentUsers.length > 0) {
      console.log('👨‍🎓 STUDENT ACCOUNTS (First 10)');
      console.log('-'.repeat(30));
      studentUsers.slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Password: password123\n`);
      });
      
      if (studentUsers.length > 10) {
        console.log(`... and ${studentUsers.length - 10} more students\n`);
      }
    }

    console.log('📈 SUMMARY');
    console.log('-'.repeat(30));
    console.log(`Total Users: ${users.length}`);
    console.log(`Admin: ${adminUsers.length}`);
    console.log(`Lecturers: ${lecturerUsers.length}`);
    console.log(`Students: ${studentUsers.length}`);

  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUsers();
