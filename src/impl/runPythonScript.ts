import { execa } from "execa";
import { join } from "node:path";

export async function runPythonScript(
  path: string,
  args: string[]
): Promise<string> {
  if (path === "") {
    path = join(__dirname, "..", "scripts", "python-script.py");
  }

  const { stdout } = await execa("python3", [path, ...args]);

  return stdout;
}
