-- App-wide role (distinct from ChatMember.role).
CREATE TYPE "UserAppRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

ALTER TABLE "User" ADD COLUMN "role" "UserAppRole" NOT NULL DEFAULT 'USER';

-- Grant admin (replace email), then ask the user to log out and log in again so JWT picks up role:
-- UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
