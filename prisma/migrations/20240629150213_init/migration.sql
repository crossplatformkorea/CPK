-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'intersex');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('email', 'google', 'apple');

-- CreateEnum
CREATE TYPE "Nationality" AS ENUM ('SouthKorea', 'UnitedStates', 'Unknown');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "full_name" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "phone_verified" BOOLEAN DEFAULT false,
    "provider_id" TEXT,
    "sub" TEXT,
    "provider" "AuthType" NOT NULL DEFAULT 'email',
    "description" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" "Gender",
    "phone" TEXT,
    "locale" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "email_confirmed_at" TIMESTAMP(3),
    "last_sign_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "bio" TEXT,
    "nationality" TEXT DEFAULT 'Unknown',
    "organization" TEXT,
    "meetup_id" TEXT,
    "github_id" TEXT,
    "twitter_id" TEXT,
    "threads_id" TEXT,
    "desired_connection" TEXT,
    "motivation_for_event_participation" TEXT,
    "future_expectations" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "user_id" UUID,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" VARCHAR(50) NOT NULL,
    "tag" VARCHAR(50) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DeveloperToTag" (
    "A" UUID NOT NULL,
    "B" VARCHAR(50) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "developers_email_key" ON "developers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_key" ON "tags"("tag");

-- CreateIndex
CREATE INDEX "tags_tag_idx" ON "tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperToTag_AB_unique" ON "_DeveloperToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperToTag_B_index" ON "_DeveloperToTag"("B");

-- AddForeignKey
ALTER TABLE "developers" ADD CONSTRAINT "developers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperToTag" ADD CONSTRAINT "_DeveloperToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperToTag" ADD CONSTRAINT "_DeveloperToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
