-- CreateTable
CREATE TABLE "check-in" (
    "id" SERIAL NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendee_id" INTEGER NOT NULL,

    CONSTRAINT "check-in_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "check-in_attendee_id_key" ON "check-in"("attendee_id");

-- AddForeignKey
ALTER TABLE "check-in" ADD CONSTRAINT "check-in_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
