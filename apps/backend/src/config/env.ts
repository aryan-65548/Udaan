import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Look for .env in current directory, apps/backend directory, and workspace root
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps/backend/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// Fallback to default dotenv configuration
dotenv.config();
