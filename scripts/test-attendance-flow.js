const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function testAttendanceFlow() {
  try {
    console.log('🧪 Testing Complete Attendance Flow\n');
    
    // Step 1: Find a lecturer and course
    const lecturer = await prisma.user.findFirst({
      where: { role: 'LECTURER' },
      include: { course: true }
    });
    
    if (!lecturer || lecturer.course.length === 0) {
      console.log('❌ No lecturer with courses found');
      return;
    }
    
    const course = lecturer.course[0];
    console.log(`👨‍🏫 Lecturer: ${lecturer.name} (${lecturer.email})`);
    console.log(`📚 Course: ${course.name} (${course.code})\n`);
    
    // Step 2: Create a new session
    const sessionId = generateSessionCode();
    const session = await prisma.attendancesession.create({
      data: {
        id: sessionId,
        code: sessionId,
        courseId: course.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        createdAt: new Date()
      }
    });
    
    console.log(`✅ Created session: ${session.id}`);
    console.log(`🔗 QR Code URL: http://localhost:9002/attendance/${session.id}`);
    console.log(`🔗 Lecturer URL: http://localhost:9002/lecturer/courses/${course.id}/session/${session.id}\n`);
    
    // Step 3: Find students enrolled in this course
    const enrolledStudents = await prisma.courseenrollment.findMany({
      where: { courseId: course.id },
      include: { user: true },
      take: 3
    });
    
    if (enrolledStudents.length === 0) {
      console.log('❌ No students enrolled in this course');
      return;
    }
    
    console.log(`👥 Found ${enrolledStudents.length} enrolled students:\n`);
    
    // Step 4: Test attendance marking for each student
    for (let i = 0; i < enrolledStudents.length; i++) {
      const enrollment = enrolledStudents[i];
      const student = enrollment.user;
      
      console.log(`Testing attendance for: ${student.name} (${student.email})`);
      
      try {
        // Simulate the API call that would be made by the attendance form
        const attendanceData = {
          id: generateId(),
          studentId: student.id,
          sessionId: session.id,
          status: i === 0 ? 'Present' : i === 1 ? 'Present' : 'Late',
          timestamp: new Date()
        };
        
        const attendanceRecord = await prisma.attendancerecord.create({
          data: attendanceData
        });
        
        console.log(`  ✅ Marked as ${attendanceRecord.status} at ${attendanceRecord.timestamp}`);
        
      } catch (error) {
        console.log(`  ❌ Failed to mark attendance: ${error.message}`);
      }
    }
    
    console.log('\n📊 Final Session Status:');
    
    // Step 5: Verify the attendance records
    const finalAttendance = await prisma.attendancerecord.findMany({
      where: { sessionId: session.id },
      include: { user: true },
      orderBy: { timestamp: 'asc' }
    });
    
    console.log(`Total attendance records: ${finalAttendance.length}`);
    finalAttendance.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.user.name}: ${record.status} (${record.timestamp})`);
    });
    
    // Step 6: Test URLs and endpoints
    console.log('\n🔗 Test URLs:');
    console.log(`Student Attendance Page: http://localhost:9002/attendance/${session.id}`);
    console.log(`Lecturer Session Page: http://localhost:9002/lecturer/courses/${course.id}/session/${session.id}`);
    console.log(`Live Updates API: http://localhost:9002/api/sessions/${session.id}/live`);
    console.log(`Mark Attendance API: POST http://localhost:9002/api/attendance/mark`);
    
    console.log('\n✅ Attendance flow test completed successfully!');
    console.log('\n📝 Test Summary:');
    console.log(`- Session created: ${session.id}`);
    console.log(`- Students tested: ${enrolledStudents.length}`);
    console.log(`- Attendance records: ${finalAttendance.length}`);
    console.log(`- QR code URL generated: ✅`);
    console.log(`- Session code available: ${session.code}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAttendanceFlow();
