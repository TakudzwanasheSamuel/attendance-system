const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

async function testAuth() {
  try {
    console.log('🔍 Testing authentication system...\n');

    // Find a lecturer user
    const lecturer = await prisma.user.findFirst({
      where: { role: 'LECTURER' }
    });

    if (!lecturer) {
      console.log('❌ No lecturer found in database');
      return;
    }

    console.log('👨‍🏫 Found lecturer:', {
      id: lecturer.id,
      name: lecturer.name,
      email: lecturer.email,
      role: lecturer.role
    });

    // Generate a token
    const payload = {
      id: lecturer.id,
      email: lecturer.email,
      role: lecturer.role,
      name: lecturer.name
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    console.log('\n🎫 Generated token:', token.substring(0, 50) + '...');

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token verification successful:', {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name
      });
    } catch (error) {
      console.log('\n❌ Token verification failed:', error.message);
    }

    console.log('\n📋 Test completed successfully!');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
