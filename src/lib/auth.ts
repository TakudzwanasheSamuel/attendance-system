import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { user_role } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface UserPayload {
  id: string
  email: string
  role: user_role
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  console.log('🔐 Authentication attempt:', { email, passwordLength: password.length });
  
  const user = await prisma.user.findUnique({
    where: { email }
  })

  console.log('👤 User lookup result:', user ? { id: user.id, email: user.email, role: user.role } : 'User not found');

  if (!user) {
    console.log('❌ User not found for email:', email);
    return null
  }

  console.log('🔍 Verifying password...');
  const isValidPassword = await verifyPassword(password, user.password)
  console.log('🔑 Password verification result:', isValidPassword);
  
  if (!isValidPassword) {
    console.log('❌ Invalid password for user:', email);
    return null
  }

  console.log('✅ Authentication successful for user:', { id: user.id, email: user.email, role: user.role });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: user_role
}) {
  const hashedPassword = await hashPassword(data.password)
  
  // Generate unique ID
  const id = Math.random().toString(36).substring(2, 15) +
             Math.random().toString(36).substring(2, 15);
  
  return prisma.user.create({
    data: {
      id,
      ...data,
      password: hashedPassword
    }
  })
}
