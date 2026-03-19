-- Safe if 0004 already ran: ensures production DBs that never applied 0004 still have the column.
ALTER TABLE "craving" ADD COLUMN IF NOT EXISTS "reflect_skill" integer;
