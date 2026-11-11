ALTER TYPE "TaskStatus" ADD VALUE 'CANCELLED';

ALTER TABLE "Task"
  ADD COLUMN "inspectorNotes" TEXT,
  ADD COLUMN "revisionNote" TEXT,
  ADD COLUMN "cancellationReason" TEXT,
  ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE TABLE "ProofPhoto" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "data" BYTEA NOT NULL,
  "contentType" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProofPhoto_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProofPhoto_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TaskEvent" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "status" "TaskStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TaskEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Task_status_targetLat_targetLng_idx" ON "Task"("status", "targetLat", "targetLng");
CREATE INDEX "ProofPhoto_taskId_idx" ON "ProofPhoto"("taskId");
CREATE INDEX "TaskEvent_taskId_createdAt_idx" ON "TaskEvent"("taskId", "createdAt");
