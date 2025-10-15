const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('\n📋 User List:\n');
    
    // Get admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    console.log('👑 ADMIN:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: password123\n`);
    
    // Get some lecturers
    const lecturers = await prisma.user.findMany({
      where: { role: 'LECTURER' },
      take: 5
    });
    console.log('👨‍🏫 LECTURERS (sample):');
    lecturers.forEach(l => console.log(`   ${l.name} - ${l.email}`));
    
    // Get some students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      take: 5
    });
    console.log('\n👨‍🎓 STUDENTS (sample):');
    students.forEach(s => console.log(`   ${s.name} - ${s.email}`));
    
    // Search for Blessing Mlambo specifically
    const blessing = await prisma.user.findMany({
      where: {
        name: {
          contains: 'Blessing'
        },
        AND: {
          name: {
            contains: 'Mlambo'
          }
        }
      }
    });
    
    if (blessing.length > 0) {
      console.log('\n🔍 Found Blessing Mlambo:');
      blessing.forEach(b => console.log(`   ${b.name} - ${b.email} (${b.role})`));
    }
    
    console.log('\n✅ All users have password: password123\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
