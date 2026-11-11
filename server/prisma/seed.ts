import "../src/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_REQUESTER_PHONE = "+919876543210";
const DEMO_INSPECTOR_PHONE = "+919876543211";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo accounts in production.");
  }

  const requester =
    (await prisma.user.findUnique({ where: { phone: DEMO_REQUESTER_PHONE } })) ??
    (await prisma.user.create({
      data: {
        name: "Demo Requester",
        phone: DEMO_REQUESTER_PHONE,
        phoneVerifiedAt: new Date(),
        role: "USER",
        requesterProfile: { create: {} },
      },
    }));

  await prisma.user.findUnique({ where: { phone: DEMO_INSPECTOR_PHONE } }) ??
    (await prisma.user.create({
      data: {
        name: "Demo Inspector",
        phone: DEMO_INSPECTOR_PHONE,
        phoneVerifiedAt: new Date(),
        role: "CAPTAIN",
        captainProfile: { create: {} },
      },
    }));

  const demoTitle = "Demo: 2BHK rental check — Indiranagar";
  const existingVisit = await prisma.task.findFirst({
    where: { title: demoTitle, createdById: requester.id },
  });

  if (!existingVisit) {
    await prisma.task.create({
      data: {
        title: demoTitle,
        description:
          "Check the flat condition, water supply, parking, and ask the caretaker for access. Photos of each room requested.",
        targetLat: 12.9719,
        targetLng: 77.6412,
        createdById: requester.id,
        visitPlan: "STANDARD",
        quotedPricePaise: 99900,
      },
    });
  }

  console.log("Demo data ready:");
  console.log(`  Requester  ${DEMO_REQUESTER_PHONE}  (Demo Requester)`);
  console.log(`  Inspector  ${DEMO_INSPECTOR_PHONE}  (Demo Inspector)`);
  console.log("Request an OTP from the login screen to sign in.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
