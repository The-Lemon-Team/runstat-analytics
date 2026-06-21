-- YouTube OAuth was removed; metrics use YOUTUBE_API_KEY instead.
-- Idempotent: no-op when the enum was created without GOOGLE (fresh migrate).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'OAuthProvider' AND e.enumlabel = 'GOOGLE'
  ) THEN
    DELETE FROM "oauth_connections" WHERE "provider"::text = 'GOOGLE';

    ALTER TYPE "OAuthProvider" RENAME TO "OAuthProvider_old";
    CREATE TYPE "OAuthProvider" AS ENUM ('VK', 'FACEBOOK');
    ALTER TABLE "oauth_connections"
      ALTER COLUMN "provider" TYPE "OAuthProvider"
      USING ("provider"::text::"OAuthProvider");
    DROP TYPE "OAuthProvider_old";
  END IF;
END $$;
