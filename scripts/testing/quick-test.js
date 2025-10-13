const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickTest() {
  console.log('🧪 Running Quick System Test...\n');
  
  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Database connected successfully\n');
    
    // Test 2: Check Users
    console.log('2️⃣ Checking users...');
    const userCount = await prisma.user.count();
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });
    
    console.log(`   📊 Total users: ${userCount}`);
    usersByRole.forEach(group => {
      console.log(`   👤 ${group.role}: ${group._count.role}`);
    });
    console.log('');
    
    // Test 3: Check Courses
    console.log('3️⃣ Checking courses...');
    const courseCount = await prisma.course.count();
    const courses = await prisma.course.findMany({
      select: {
        name: true,
        code: true,
        user: { select: { name: true } }
      },
      take: 3
    });
    
    console.log(`   📚 Total courses: ${courseCount}`);
    courses.forEach(course => {
      console.log(`   📖 ${course.name} (${course.code}) - ${course.user.name}`);
    });
    console.log('');
    
    // Test 4: Check Enrollments
    console.log('4️⃣ Checking enrollments...');
    const enrollmentCount = await prisma.courseenrollment.count();
    console.log(`   🎓 Total enrollments: ${enrollmentCount}\n`);
    
    // Test 5: Check Sessions
    console.log('5️⃣ Checking attendance sessions...');
    const sessionCount = await prisma.attendancesession.count();
    const activeSessions = await prisma.attendancesession.count({
      where: { expiresAt: { gt: new Date() } }
    });
    
    console.log(`   📅 Total sessions: ${sessionCount}`);
    console.log(`   🟢 Active sessions: ${activeSessions}\n`);
    
    // Test 6: Check Attendance Records
    console.log('6️⃣ Checking attendance records...');
    const attendanceCount = await prisma.attendancerecord.count();
    console.log(`   ✅ Total attendance records: ${attendanceCount}\n`);
    
    // Test 7: Performance Check
    console.log('7️⃣ Performance check...');
    const startTime = Date.now();
    
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.attendancesession.count()
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`   ⚡ Concurrent queries completed in ${duration}ms\n`);
    
    // Summary
    console.log('📋 QUICK TEST SUMMARY');
    console.log('═'.repeat(40));
    console.log('✅ Database: Connected');
    console.log(`✅ Users: ${userCount} found`);
    console.log(`✅ Courses: ${courseCount} found`);
    console.log(`✅ Enrollments: ${enrollmentCount} found`);
    console.log(`✅ Sessions: ${sessionCount} found (${activeSessions} active)`);
    console.log(`✅ Attendance: ${attendanceCount} records`);
    console.log(`✅ Performance: ${duration}ms response time`);
    console.log('');
    
    if (userCount === 0) {
      console.log('⚠️  WARNING: No users found. Run "npm run seed" to create test data.');
    }
    
    if (courseCount === 0) {
      console.log('⚠️  WARNING: No courses found. Create courses through admin panel.');
    }
    
    console.log('🎉 Quick test completed successfully!');
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
