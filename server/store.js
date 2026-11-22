import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const FILE = resolve(process.cwd(), 'data', 'session.json');

export async function loadSession() {
  try {
    const parsed = JSON.parse(await readFile(FILE, 'utf8'));
    return {
      events: Array.isArray(parsed.events) ? parsed.events.slice(-200) : [],
      showActive: Boolean(parsed.showActive)
    };
  } catch {
    return { events: [], showActive: false };
  }
}

export async function saveSession(session) {
  await mkdir(dirname(FILE), { recursive: true });
  const temporary = FILE + '.tmp';
  const safe = {
    events: Array.isArray(session.events) ? session.events.slice(-200) : [],
    showActive: Boolean(session.showActive),
    updatedAt: new Date().toISOString()
  };
  await writeFile(temporary, JSON.stringify(safe, null, 2), 'utf8');
  await rename(temporary, FILE);
}
