import config from "@/lib/config";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from "@neondatabase/serverless";

const sql = neon(config.env.databaseUrl);

export const db = drizzle(process.env.DATABASE_URL!);