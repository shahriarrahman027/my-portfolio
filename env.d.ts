/// <reference path="./.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ADMIN_SECRET?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly GITHUB_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
