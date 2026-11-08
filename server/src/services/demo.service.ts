import { prisma } from "../lib";
import {
  DEMO_ACCOUNTS,
  getAuthMode,
  logger,
  requireDemoAuth,
  signToken,
  type DemoRole,
} from "../utils";

const userSelect = {
  id: true,
  name: true,
  phone: true,
  phoneVerifiedAt: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

const DEMO_EVIDENCE_PATH = "/uploads/demo-proof.svg";

const DEMO_EVIDENCE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Illustrative sample photo of a low-rise house, compound wall, and gate">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6e5"/>
      <stop offset="1" stop-color="#ffe9b8"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fffbf2"/>
      <stop offset="1" stop-color="#ffefd6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#sky)"/>
  <circle cx="985" cy="150" r="78" fill="#ffc400" opacity=".9"/>
  <path d="M0 610 Q300 560 620 600 T1200 570V900H0Z" fill="#9fd4b1"/>
  <path d="M0 700 Q340 645 700 690 T1200 665V900H0Z" fill="#6fbb8b"/>
  <path d="M0 790 Q400 745 800 780 T1200 770V900H0Z" fill="#43b077"/>

  <rect x="285" y="400" width="630" height="320" rx="8" fill="url(#wall)" stroke="#0f4a30" stroke-width="6"/>
  <path d="M250 405 600 190 950 405Z" fill="#ffc400" stroke="#0f4a30" stroke-width="6" stroke-linejoin="round"/>
  <rect x="535" y="520" width="120" height="200" rx="4" fill="#0f4a30"/>
  <circle cx="635" cy="620" r="6" fill="#ffc400"/>
  <rect x="360" y="470" width="120" height="96" rx="6" fill="#d6f0df" stroke="#0f4a30" stroke-width="5"/>
  <rect x="720" y="470" width="120" height="96" rx="6" fill="#d6f0df" stroke="#0f4a30" stroke-width="5"/>
  <path d="M360 518h120M420 470v96M720 518h120M780 470v96" stroke="#0f4a30" stroke-width="4"/>

  <rect x="240" y="620" width="720" height="90" rx="6" fill="#e3d3bb" stroke="#0f4a30" stroke-width="5"/>
  <rect x="540" y="620" width="120" height="90" fill="#0f4a30"/>
  <path d="M540 650h120M540 680h120" stroke="#ffc400" stroke-width="4"/>
  <path d="M180 735h840" stroke="#0f4a30" stroke-width="7"/>

  <g>
    <rect x="140" y="585" width="16" height="150" rx="8" fill="#0f4a30"/>
    <circle cx="148" cy="550" r="58" fill="#218f5c"/>
    <circle cx="112" cy="590" r="38" fill="#43b077"/>
    <circle cx="186" cy="590" r="38" fill="#43b077"/>
  </g>
  <g>
    <rect x="1035" y="605" width="14" height="130" rx="7" fill="#0f4a30"/>
    <circle cx="1042" cy="575" r="46" fill="#218f5c"/>
    <circle cx="1012" cy="606" r="30" fill="#43b077"/>
  </g>

  <g font-family="Plus Jakarta Sans, Noto Sans, sans-serif">
    <rect x="54" y="52" width="250" height="52" rx="26" fill="#ffffff" opacity=".92"/>
    <circle cx="82" cy="78" r="8" fill="#218f5c"/>
    <text x="100" y="85" font-size="20" font-weight="700" fill="#0f4a30">Sample proof photo</text>
    <rect x="54" y="800" width="380" height="52" rx="26" fill="#0f4a30" opacity=".92"/>
    <text x="79" y="834" font-size="19" font-weight="600" fill="#ffffff">23 m from pin · GPS accuracy ±4 m</text>
  </g>
</svg>`;

function transform(user: {
  id: string;
  name: string;
  phone: string;
  phoneVerifiedAt: Date | null;
  email: string | null;
  role: "USER" | "CAPTAIN";
  createdAt: Date;
}) {
  return user;
}

async function ensureDemoUser(role: DemoRole) {
  const account = DEMO_ACCOUNTS[role];
  const existing = await prisma.user.findUnique({
    where: { phone: account.phone },
    select: { id: true, role: true },
  });

  const user = await prisma.user.upsert({
    where: { phone: account.phone },
    create: {
      name: account.name,
      phone: account.phone,
      phoneVerifiedAt: new Date(),
      role,
      ...(role === "CAPTAIN"
        ? { captainProfile: { create: {} } }
        : { requesterProfile: { create: {} } }),
    },
    update: {
      name: account.name,
      role,
      phoneVerifiedAt: new Date(),
    },
    select: userSelect,
  });

  if (user.role === "CAPTAIN") {
    await prisma.captainProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  } else {
    await prisma.requesterProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  return { user: transform(user), isNew: !existing };
}

export class DemoService {
  static async getMode() {
    const mode = getAuthMode();

    return {
      mode,
      phoneSignInEnabled: process.env.PUBLIC_DEMO !== "true",
      demo:
        mode === "demo"
          ? Object.entries(DEMO_ACCOUNTS).map(([role, account]) => ({
              role,
              name: account.name,
              phone: account.phone,
            }))
          : [],
    };
  }

  static async login(role: DemoRole) {
    requireDemoAuth();
    const { user, isNew } = await ensureDemoUser(role);

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    logger.info("Demo login", { role, userId: user.id });

    return { user, token, isNew };
  }

  static async reset() {
    requireDemoAuth();

    const requester = await ensureDemoUser("USER");
    const inspector = await ensureDemoUser("CAPTAIN");

    const existingTasks = await prisma.task.findMany({
      where: {
        createdById: requester.user.id,
      },
      select: { id: true, evidenceImage: true },
    });

    const taskIds = existingTasks.map((task) => task.id);

    if (taskIds.length > 0) {
      await prisma.locationLog.deleteMany({
        where: { taskId: { in: taskIds } },
      });
      await prisma.task.deleteMany({ where: { id: { in: taskIds } } });
    }

    await prisma.phoneOtp.deleteMany({
      where: {
        phone: {
          in: [DEMO_ACCOUNTS.USER.phone, DEMO_ACCOUNTS.CAPTAIN.phone],
        },
      },
    });

    await prisma.task.createMany({
      data: [
        {
          title: "Vacant plot check — Whitefield",
          description:
            "Check the compound wall, approach road, and whether the plot is clear. Photograph the front boundary and the road from the pin.",
          targetLat: 12.9698,
          targetLng: 77.7499,
          createdById: requester.user.id,
          status: "OPEN",
          visitPlan: "STANDARD",
          quotedPricePaise: 99900,
        },
        {
          title: "Construction progress — Sarjapur",
          description:
            "Visit the site and capture the current construction stage. Confirm whether the slab work has started and note any on-site activity.",
          targetLat: 12.901,
          targetLng: 77.687,
          createdById: requester.user.id,
          acceptedById: inspector.user.id,
          status: "ACCEPTED",
          visitPlan: "DETAILED",
          quotedPricePaise: 249900,
        },
        {
          title: "2BHK rental check — Indiranagar",
          description:
            "Inspect the flat condition, water supply, parking, and access. This prepared visit lets you test the proof review and completion flow.",
          targetLat: 12.9719,
          targetLng: 77.6412,
          createdById: requester.user.id,
          acceptedById: inspector.user.id,
          status: "SUBMITTED",
          visitPlan: "STANDARD",
          quotedPricePaise: 99900,
          evidenceSource: "CAMERA",
          evidenceImage: DEMO_EVIDENCE_PATH,
          evidenceLat: 12.97182,
          evidenceLng: 77.64135,
          evidenceAccuracy: 4,
          evidenceCapturedAt: new Date(Date.now() - 1000 * 60 * 32),
          evidenceSubmittedAt: new Date(Date.now() - 1000 * 60 * 25),
        },
        {
          title: "Shop shutter check — Jayanagar",
          description:
            "A completed sample visit. Open it from Past visits to see how the proof and GPS details are kept after completion.",
          targetLat: 12.9308,
          targetLng: 77.5838,
          createdById: requester.user.id,
          acceptedById: inspector.user.id,
          status: "COMPLETED",
          visitPlan: "STANDARD",
          quotedPricePaise: 99900,
          evidenceSource: "CAMERA",
          evidenceImage: DEMO_EVIDENCE_PATH,
          evidenceLat: 12.93084,
          evidenceLng: 77.58372,
          evidenceAccuracy: 5,
          evidenceCapturedAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
          evidenceSubmittedAt: new Date(Date.now() - 1000 * 60 * 60 * 25),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      ],
    });

    const proofs = await prisma.task.findMany({
      where: { createdById: requester.user.id, evidenceImage: DEMO_EVIDENCE_PATH },
      select: { id: true },
    });
    await prisma.evidence.createMany({
      data: proofs.map(({ id }) => ({
        taskId: id,
        data: Buffer.from(DEMO_EVIDENCE_SVG),
        contentType: "image/svg+xml",
      })),
    });

    logger.info("Demo data reset", { tasks: 4 });

    return {
      tasks: 4,
      accounts: Object.entries(DEMO_ACCOUNTS).map(([role, account]) => ({
        role,
        name: account.name,
        phone: account.phone,
      })),
    };
  }
}
