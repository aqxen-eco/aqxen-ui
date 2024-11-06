"use server";

import { prisma } from "@/prisma-client";

export async function getBadges() {
  return await prisma.badges.findMany();
}
