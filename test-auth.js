const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "fleet@demo.com" } });
  if (!user) {
    console.log("User not found!");
    return;
  }
  console.log("Found user:", user.email, "Hash:", user.password);
  
  const isValid = await bcrypt.compare("demo1234", user.password);
  console.log("Is valid?", isValid);
}
main().catch(console.error).finally(() => prisma.$disconnect());
