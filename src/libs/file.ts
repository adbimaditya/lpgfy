import fs from 'fs';
import path from 'path';

export async function readFileAsync(filePath: string) {
  const data = await fs.promises.readFile(filePath, 'utf-8');

  return JSON.parse(data);
}

export async function writeFileAsync(filePath: string, data: unknown) {
  await createDirectory(filePath);
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function createDirectory(filePath: string) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}
