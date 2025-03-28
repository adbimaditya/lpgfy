import fs from 'fs';
import path from 'path';

import type { CustomerType } from './types.ts';

export async function readFileAsync(filePath: string) {
  const data = await fs.promises.readFile(filePath, 'utf-8');

  return JSON.parse(data);
}

export async function writeFileAsync(filePath: string, data: unknown) {
  await ensureDirectoryExists(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function ensureDirectoryExists(filePath: string) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export function encodeCustomerType(type: CustomerType) {
  return type.replace(' ', '+');
}
