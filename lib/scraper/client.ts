import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";

export interface ScraperEnvelope {
  collector_id: string;
  status: string;
  view_url?: string;
  prompt?: string;
  next_step?: string;
  [key: string]: any;
}

/**
 * Executes a Bright Data CLI scraper command using npx, writes JSON output to a temp file,
 * parses the result envelope, and cleans up the temporary file.
 */
async function runCliCommand(args: string[]): Promise<ScraperEnvelope> {
  const tempDir = os.tmpdir();
  const tempFileName = `bd-scraper-${randomUUID()}.json`;
  const tempFilePath = path.join(tempDir, tempFileName);

  // Inject --json and -o <path> to output file as json format
  const fullArgs = [...args, "--json", "-o", tempFilePath];

  return new Promise((resolve, reject) => {
    // Windows requires shell: true because npx is resolved as npx.cmd
    const isWindows = process.platform === "win32";
    const child = spawn("npx", ["@brightdata/cli", ...fullArgs], {
      shell: isWindows,
      env: {
        ...process.env,
      },
    });

    let stderr = "";

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", async (code) => {
      try {
        if (code !== 0) {
          throw new Error(
            `Bright Data CLI command failed (code ${code}). Stderr: ${stderr.trim()}`
          );
        }

        // Read and parse the output JSON envelope
        const fileContent = await fs.readFile(tempFilePath, "utf8");
        const parsed = JSON.parse(fileContent) as ScraperEnvelope;
        resolve(parsed);
      } catch (err) {
        reject(err);
      } finally {
        // Clean up the temporary file
        try {
          await fs.unlink(tempFilePath);
        } catch {
          // Ignore clean up errors if the file doesn't exist
        }
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

export type ScraperTarget = string | string[];

/**
 * Runs a Bright Data scraper for a specific collector ID against the specified target (URL, array of URLs, or file path).
 */
export async function runCollector(
  collectorId: string,
  target: ScraperTarget
): Promise<ScraperEnvelope> {
  const args = ["scraper", "run", collectorId];

  if (Array.isArray(target)) {
    // Comma-separated list of URLs
    args.push("--urls", target.join(","));
  } else if (typeof target === "string") {
    if (target.startsWith("http://") || target.startsWith("https://")) {
      // Positional URL argument
      args.push(target);
    } else {
      // Input file path argument
      args.push("--input-file", target);
    }
  }

  return runCliCommand(args);
}

/**
 * Initiates an AI self-healing loop for a scraper when markup fails to extract fields.
 */
export async function healCollector(collectorId: string, prompt: string): Promise<ScraperEnvelope> {
  return runCliCommand(["scraper", "heal", collectorId, prompt]);
}

/**
 * Approves a proposed self-heal patch that is awaiting human-in-the-loop validation.
 */
export async function approveHeal(collectorId: string): Promise<ScraperEnvelope> {
  return runCliCommand(["scraper", "approve", collectorId]);
}
