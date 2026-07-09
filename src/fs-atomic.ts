import { copyFile, mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Windows-safe atomic JSON write.
 * On Win, rename() cannot always overwrite an existing/locked target (EPERM).
 */
export async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });

  const payload = JSON.stringify(data, null, 2);
  const tmp = path.join(
    dir,
    `${path.basename(filePath)}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`,
  );

  await writeFile(tmp, payload, "utf8");

  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // Prefer replace via rename; on Windows this often fails if dest exists.
      try {
        await rename(tmp, filePath);
        return;
      } catch (e) {
        const err = e as NodeJS.ErrnoException;
        if (err.code !== "EPERM" && err.code !== "EEXIST" && err.code !== "EACCES") {
          throw e;
        }
      }

      // Fallback: remove dest then rename
      try {
        await unlink(filePath);
      } catch {
        // ignore missing
      }
      try {
        await rename(tmp, filePath);
        return;
      } catch {
        // last resort: copy over
        await copyFile(tmp, filePath);
        await unlink(tmp).catch(() => {});
        return;
      }
    } catch (e) {
      lastErr = e;
      await sleep(30 * (attempt + 1));
    }
  }

  await unlink(tmp).catch(() => {});
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
