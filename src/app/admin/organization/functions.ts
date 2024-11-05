"use server";

import { prisma } from "@/prisma-client";

export async function getOrganization() {
  return await prisma.organization.findFirst({
    where: {
      id: 1,
    },
  });
}
