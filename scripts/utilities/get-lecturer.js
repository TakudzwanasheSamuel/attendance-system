const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getLecturer() {
  try {
    const lecturer = await prisma.user.findFirst({
      where: { role: 'LECTURER' }
    });
    
    console.log('Lecturer credentials:');
    console.log('Email:', lecturer.email);
    console.log('ID:', lecturer.id);
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getLecturer();
