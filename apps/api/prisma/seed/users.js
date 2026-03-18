const { ADMIN_USER_EMAIL, DEFAULT_DEV_USER_EMAIL } = require("./constants");

async function seedUsers(prisma) {
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_USER_EMAIL },
    update: {
      name: "System Admin",
      role: "admin",
    },
    create: {
      email: ADMIN_USER_EMAIL,
      name: "System Admin",
      role: "admin",
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: DEFAULT_DEV_USER_EMAIL },
    update: {
      name: "postigodev",
      role: "user",
    },
    create: {
      email: DEFAULT_DEV_USER_EMAIL,
      name: "postigodev",
      role: "user",
    },
  });

  return { adminUser, devUser };
}

module.exports = {
  seedUsers,
};
