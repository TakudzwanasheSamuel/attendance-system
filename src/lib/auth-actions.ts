"use server";

import { authenticateUser, createUser, generateToken } from './auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Support both direct server action invocation and useActionState signature
export async function loginAction(prevState: any, formData?: FormData) {
  console.log('🚀 Login action called with:', { prevState, formData: !!formData });
  
  const fd = formData ?? (prevState instanceof FormData ? prevState : null);
  const email = fd?.get('email') as string | undefined;
  const password = fd?.get('password') as string | undefined;

  console.log('📧 Extracted credentials:', { email, passwordLength: password?.length });

  if (!email || !password) {
    console.log('❌ Missing credentials');
    return { error: 'Email and password are required' };
  }

  try {
    console.log('🔐 Calling authenticateUser...');
    const user = await authenticateUser(email, password);
    
    if (!user) {
      console.log('❌ Authentication failed - no user returned');
      return { error: 'Invalid email or password' };
    }

    console.log('🎫 Generating JWT token for user:', user);
    // Generate JWT token
    const token = generateToken(user);
    
    console.log('🍪 Setting auth cookie...');
    // Set cookie (await cookies() per Next.js dynamic API)
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log('🎯 Determining redirect path for role:', user.role);
    // Return success with redirect path
    if (user.role === 'ADMIN') {
      console.log('✅ Redirecting to admin dashboard');
      return { success: true, redirectTo: '/admin/dashboard' };
    } else if (user.role === 'LECTURER') {
      console.log('✅ Redirecting to lecturer dashboard');
      return { success: true, redirectTo: '/lecturer/dashboard' };
    } else {
      console.log('✅ Redirecting to student dashboard');
      return { success: true, redirectTo: '/student/dashboard' };
    }
  } catch (error) {
    console.error('💥 Login error:', error);
    return { error: 'An error occurred during login' };
  }
}

export async function signupAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required' };
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
      role: role.toUpperCase() as Role,
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Redirect based on role
    if (user.role === 'LECTURER') {
      redirect('/lecturer/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'P2002') {
      return { error: 'Email already exists' };
    }
    return { error: 'An error occurred during signup' };
  }
}

export async function logoutAction() {
  cookies().delete('auth-token');
  redirect('/login');
}
