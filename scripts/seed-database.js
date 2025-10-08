const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Zimbabwean names
const zimbabweanNames = {
  male: [
    'Tendai', 'Blessing', 'Tatenda', 'Tinashe', 'Kudzai', 'Tafadzwa', 'Rumbidzai', 'Rutendo',
    'Tariro', 'Tonderai', 'Tendekai', 'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai',
    'Tendai', 'Tafadzwa', 'Tendai', 'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai',
    'Tendai', 'Tafadzwa', 'Tendai', 'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai',
    'Tendai', 'Tafadzwa', 'Tendai', 'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai',
    'Tendai', 'Tafadzwa', 'Tendai', 'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai'
  ],
  female: [
    'Ruvimbo', 'Nyasha', 'Kudzai', 'Rumbidzai', 'Rutendo', 'Tariro', 'Tendai', 'Tafadzwa',
    'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai', 'Ruvimbo', 'Nyasha', 'Kudzai',
    'Rumbidzai', 'Rutendo', 'Tariro', 'Tendai', 'Tafadzwa', 'Tapiwa', 'Tawanda', 'Tendai',
    'Tafara', 'Tendekai', 'Ruvimbo', 'Nyasha', 'Kudzai', 'Rumbidzai', 'Rutendo', 'Tariro',
    'Tendai', 'Tafadzwa', 'Tapiwa', 'Tawanda', 'Tendai', 'Tafara', 'Tendekai', 'Ruvimbo',
    'Nyasha', 'Kudzai', 'Rumbidzai', 'Rutendo', 'Tariro', 'Tendai', 'Tafadzwa', 'Tapiwa'
  ],
  surnames: [
    'Mlambo', 'Dube', 'Chirwa', 'Mutevedzi', 'Moyo', 'Ncube', 'Mpofu', 'Nkomo', 'Mugabe',
    'Chigwada', 'Mazvihwa', 'Mukamuri', 'Mazvihwa', 'Mukamuri', 'Chigwada', 'Mugabe', 'Nkomo',
    'Mpofu', 'Ncube', 'Moyo', 'Mutevedzi', 'Chirwa', 'Dube', 'Mlambo', 'Mazvihwa', 'Mukamuri',
    'Chigwada', 'Mugabe', 'Nkomo', 'Mpofu', 'Ncube', 'Moyo', 'Mutevedzi', 'Chirwa', 'Dube',
    'Mlambo', 'Mazvihwa', 'Mukamuri', 'Chigwada', 'Mugabe', 'Nkomo', 'Mpofu', 'Ncube', 'Moyo',
    'Mutevedzi', 'Chirwa', 'Dube', 'Mlambo', 'Mazvihwa', 'Mukamuri', 'Chigwada', 'Mugabe'
  ]
};

const courseNames = [
  'Introduction to Computer Science', 'Data Structures and Algorithms', 'Database Systems',
  'Software Engineering', 'Web Development', 'Mobile App Development', 'Machine Learning',
  'Artificial Intelligence', 'Computer Networks', 'Operating Systems', 'Cybersecurity',
  'Human-Computer Interaction', 'Software Testing', 'Project Management', 'Digital Marketing',
  'Business Analytics', 'Financial Accounting', 'Microeconomics', 'Macroeconomics', 'Statistics'
];

const courseCodes = [
  'CS101', 'CS201', 'CS301', 'CS401', 'CS501', 'CS601', 'CS701', 'CS801', 'CS901', 'CS1001',
  'CS1101', 'CS1201', 'CS1301', 'CS1401', 'CS1501', 'CS1601', 'CS1701', 'CS1801', 'CS1901', 'CS2001'
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateZimbabweanName() {
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const firstName = getRandomElement(zimbabweanNames[gender]);
  const lastName = getRandomElement(zimbabweanNames.surnames);
  return `${firstName} ${lastName}`;
}

function generateEmail(name, index = 0) {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const suffix = index > 0 ? `.${index}` : '';
  return `${cleanName}${suffix}@msu.com`;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.attendancerecord.deleteMany();
    await prisma.attendancesession.deleteMany();
    await prisma.courseenrollment.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // Create lecturers
    console.log('👨‍🏫 Creating lecturers...');
    const lecturers = [];
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    for (let i = 0; i < 15; i++) {
      const name = generateZimbabweanName();
      const email = generateEmail(name, i);
      
      const lecturer = await prisma.user.create({
        data: {
          id: generateId(),
          name,
          email,
          password: hashedPassword,
          role: 'LECTURER'
        }
      });
      lecturers.push(lecturer);
    }

    // Create students
    console.log('👨‍🎓 Creating students...');
    const students = [];
    
    for (let i = 0; i < 100; i++) {
      const name = generateZimbabweanName();
      const email = generateEmail(name, i + 15); // Offset to avoid conflicts with lecturers
      
      const student = await prisma.user.create({
        data: {
          id: generateId(),
          name,
          email,
          password: hashedPassword,
          role: 'STUDENT'
        }
      });
      students.push(student);
    }

    // Create courses
    console.log('📚 Creating courses...');
    const courses = [];
    
    for (let i = 0; i < 20; i++) {
      const lecturer = getRandomElement(lecturers);
      const course = await prisma.course.create({
        data: {
          id: generateId(),
          name: courseNames[i],
          code: courseCodes[i],
          lecturerId: lecturer.id
        }
      });
      courses.push(course);
    }

    // Enroll students in courses (random enrollments)
    console.log('📝 Enrolling students in courses...');
    for (const course of courses) {
      const numEnrollments = Math.floor(Math.random() * 30) + 10; // 10-40 students per course
      const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(numEnrollments, students.length); i++) {
        await prisma.courseenrollment.create({
          data: {
            studentId: shuffledStudents[i].id,
            courseId: course.id
          }
        });
      }
    }

    // Create attendance sessions
    console.log('📅 Creating attendance sessions...');
    const sessions = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    for (const course of courses) {
      // Create 5-15 sessions per course
      const numSessions = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < numSessions; i++) {
        const sessionDate = getRandomDate(threeMonthsAgo, now);
        const expiresAt = new Date(sessionDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
        
        const session = await prisma.attendancesession.create({
          data: {
            id: generateId(),
            courseId: course.id,
            code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            expiresAt
          }
        });
        sessions.push(session);
      }
    }

    // Create attendance records
    console.log('✅ Creating attendance records...');
    for (const session of sessions) {
      // Get enrolled students for this course
      const enrollments = await prisma.courseenrollment.findMany({
        where: { courseId: session.courseId }
      });
      
      for (const enrollment of enrollments) {
        // 80% attendance rate (some students absent)
        const isPresent = Math.random() < 0.8;
        
        if (isPresent) {
          const status = Math.random() < 0.9 ? 'Present' : 'Late';
          const attendanceTime = new Date(session.createdAt.getTime() + Math.random() * 60000); // Within 1 minute
          
          await prisma.attendancerecord.create({
            data: {
              id: generateId(),
              sessionId: session.id,
              studentId: enrollment.studentId,
              status,
              timestamp: attendanceTime
            }
          });
        }
      }
    }

    // Create admin user
    console.log('👑 Creating admin user...');
    await prisma.user.create({
      data: {
        id: generateId(),
        name: 'System Administrator',
        email: 'admin@msu.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${lecturers.length} lecturers created`);
    console.log(`   - ${students.length} students created`);
    console.log(`   - ${courses.length} courses created`);
    console.log(`   - ${sessions.length} attendance sessions created`);
    console.log(`   - Multiple attendance records created with realistic attendance patterns`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
