import fs from 'fs';
import path from 'path';

/**
 * Reads the project version from version.txt at the root.
 * This should only be called from Server Components or Server Actions.
 */
export function getProjectVersion(): string {
  try {
    const versionPath = path.join(process.cwd(), 'version.txt');
    if (!fs.existsSync(versionPath)) {
      return 'v0.0.0';
    }
    return fs.readFileSync(versionPath, 'utf8').trim();
  } catch (error) {
    console.error('Failed to read project version:', error);
    return 'v0.0.0';
  }
}
