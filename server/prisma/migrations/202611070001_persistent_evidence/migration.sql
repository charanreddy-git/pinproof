CREATE TABLE "Evidence" (
    "taskId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("taskId")
);
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
