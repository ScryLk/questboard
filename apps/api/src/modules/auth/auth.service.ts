import type { PrismaClient } from "@questboard/db";

export function createAuthService(prisma: PrismaClient) {
  return {
    async handleUserCreated(data: {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name: string | null;
      last_name: string | null;
      image_url: string | null;
      username: string | null;
    }) {
      const email = data.email_addresses[0]?.email_address;
      if (!email) throw new Error("No email address found in webhook data");

      const displayName = [data.first_name, data.last_name].filter(Boolean).join(" ") || email.split("@")[0]!;

      const user = await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          email,
          displayName,
          avatarUrl: data.image_url,
          username: data.username,
        },
        create: {
          clerkId: data.id,
          email,
          displayName,
          avatarUrl: data.image_url,
          username: data.username,
          userStats: { create: {} },
        },
      });

      return user;
    },

    async handleUserUpdated(data: {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name: string | null;
      last_name: string | null;
      image_url: string | null;
      username: string | null;
    }) {
      const email = data.email_addresses[0]?.email_address;
      const displayName = [data.first_name, data.last_name].filter(Boolean).join(" ");

      const updateData: Record<string, unknown> = {};
      if (email) updateData.email = email;
      if (displayName) updateData.displayName = displayName;
      if (data.image_url !== undefined) updateData.avatarUrl = data.image_url;
      if (data.username !== undefined) updateData.username = data.username;

      return prisma.user.update({
        where: { clerkId: data.id },
        data: updateData,
      });
    },

    async handleUserDeleted(data: { id: string }) {
      return prisma.user.update({
        where: { clerkId: data.id },
        data: { deletedAt: new Date() },
      });
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
