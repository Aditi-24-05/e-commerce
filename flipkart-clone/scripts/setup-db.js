
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres:srrNNDvlui4YevTn@db.uztagjejpcbxgnnhsysg.supabase.co:5432/postgres';

const client = new pg.Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log('Connected to database...');

        const schemaPath = path.resolve(__dirname, '../c:/Users/aditi/.gemini/antigravity/brain/242807ea-a288-43c2-85a7-f34a5115d439/schema.sql');

        // Check if schema file exists, if not try local path or ask user
        // Since I know the artifact path, I'll use the absolute path provided in the previous turn or relative if I copied it.
        // Actually, I should probably read the content directly from the artifact path since I can't rely on relative paths easily with absolute artifacts.
        // Let's just embed the SQL content here to be safe and avoid path issues, OR read the artifact file directly if `fs` allows absolute paths (which it does).

        // Reading the artifact file directly:
        const sql = fs.readFileSync('c:/Users/aditi/.gemini/antigravity/brain/242807ea-a288-43c2-85a7-f34a5115d439/schema.sql', 'utf8');

        console.log('Executing schema script...');
        await client.query(sql);

        console.log('Database setup completed successfully!');
    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
