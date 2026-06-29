/**
 * One-off: rename a profile username (and sync auth user_metadata).
 * Usage: node scripts/rename-username.mjs <from> <to>
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const [from, to] = process.argv.slice(2);
if (!from || !to) {
  console.error("Usage: node scripts/rename-username.mjs <from> <to>");
  process.exit(1);
}

const fromUsername = from.toLowerCase();
const toUsername = to.toLowerCase();

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local");
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existingTarget, error: targetError } = await supabase
  .from("profiles")
  .select("id")
  .eq("username", toUsername)
  .maybeSingle();

if (targetError) {
  console.error("Failed to check target username:", targetError.message);
  process.exit(1);
}

if (existingTarget) {
  console.error(`Username "${toUsername}" is already taken.`);
  process.exit(1);
}

const { data: profile, error: fetchError } = await supabase
  .from("profiles")
  .select("id, username, display_name")
  .eq("username", fromUsername)
  .maybeSingle();

if (fetchError) {
  console.error("Failed to fetch profile:", fetchError.message);
  process.exit(1);
}

if (!profile) {
  console.error(`No profile found with username "${fromUsername}".`);
  process.exit(1);
}

const { error: updateError } = await supabase
  .from("profiles")
  .update({ username: toUsername })
  .eq("id", profile.id);

if (updateError) {
  console.error("Failed to update profile:", updateError.message);
  process.exit(1);
}

const { error: authError } = await supabase.auth.admin.updateUserById(profile.id, {
  user_metadata: {
    username: toUsername,
    display_name: profile.display_name ?? toUsername,
  },
});

if (authError) {
  console.error("Profile updated but auth metadata failed:", authError.message);
  process.exit(1);
}

console.log(`Renamed @${fromUsername} → @${toUsername} (${profile.id})`);
