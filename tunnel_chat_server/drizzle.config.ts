import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle/migrations',
    dialect: 'postgresql',
    strict: true,
    dbCredentials: {
        url: process.env.DATABASE_URL || 'postgresql://tunnel_user:secure_password@localhost:5432/tunnel_chat',
    },
});
