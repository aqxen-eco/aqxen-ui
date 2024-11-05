"use server";

import { prisma } from "@/prisma-client";

type createOrganizationProps = {
  name: string;
  logo: string;
};

export async function createOrganization({
  name,
  logo,
}: createOrganizationProps) {
  await prisma.organization.upsert({
    create: {
      name,
      logo,
    },
    update: {
      name,
      logo,
    },
    where: {
      id: 1,
    },
  });
}
