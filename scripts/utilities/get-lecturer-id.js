const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getLecturerId() {
  try {
    console.log('🔍 Finding lecturer IDs from database...\n');
    
    const lecturers = await prisma.user.findMany({
      where: { role: 'LECTURER' },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 5 // Get first 5 lecturers
    });

    if (lecturers.length === 0) {
      console.log('❌ No lecturers found in database');
      return;
    }

    console.log('👨‍🏫 AVAILABLE LECTURER ACCOUNTS');
    console.log('=' .repeat(50));
    
    lecturers.forEach((lecturer, index) => {
      console.log(`${index + 1}. ID: ${lecturer.id}`);
      console.log(`   Name: ${lecturer.name}`);
      console.log(`   Email: ${lecturer.email}`);
      console.log(`   Password: password123\n`);
    });

    console.log('🎯 TO UPDATE LECTURER DASHBOARD:');
    console.log('Replace MOCK_LECTURER_ID with one of the IDs above');
    console.log(`Example: const MOCK_LECTURER_ID = '${lecturers[0].id}';`);

  } catch (error) {
    console.error('❌ Error fetching lecturers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getLecturerId();
