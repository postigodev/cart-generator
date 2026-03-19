const { randomBytes, scryptSync } = require("node:crypto");
const {
  ADMIN_USER_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_DEV_USER_EMAIL,
  DEFAULT_DEV_USER_PASSWORD,
} = require("./constants");

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${derivedKey}`;
}

async function upsertPasswordIdentity(prisma, userId, email, password) {
  const passwordHash = hashPassword(password);

  await prisma.authIdentity.upsert({
    where: {
      provider_providerSubject: {
        provider: "password",
        providerSubject: email,
      },
    },
    update: {
      userId,
      email,
      passwordHash,
    },
    create: {
      userId,
      provider: "password",
      providerSubject: email,
      email,
      emailVerified: true,
      passwordHash,
    },
  });
}

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
  await upsertPasswordIdentity(
    prisma,
    adminUser.id,
    ADMIN_USER_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
  );

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
  await upsertPasswordIdentity(
    prisma,
    devUser.id,
    DEFAULT_DEV_USER_EMAIL,
    DEFAULT_DEV_USER_PASSWORD,
  );

  return { adminUser, devUser };
}

module.exports = {
  seedUsers,
};
