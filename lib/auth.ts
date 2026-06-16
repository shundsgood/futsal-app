import { prisma } from "@/lib/prisma";

const DUMMY_USER_ID = "dummy-user-01";

export async function getCurrentUser() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: DUMMY_USER_ID },
  });
  return user;
}
