"use server";

import { cookies } from "next/headers";
import { verifyToken, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfileAction(name: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) throw new Error('Not authenticated');

  await prisma.user.update({
    where: { id: payload.id },
    data: { name }
  });
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return { error: 'Not authenticated' };

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return { error: 'User not found' };

  const ok = await verifyPassword(currentPassword, user.password);
  if (!ok) return { error: 'Current password is incorrect' };

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return { success: true };
}


