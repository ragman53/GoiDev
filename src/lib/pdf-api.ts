import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

export async function selectPdfPath(): Promise<string | null> {
  try {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (Array.isArray(selected)) {
      return selected[0] ?? null;
    }
    return selected ?? null;
  } catch (e) {
    console.error("Error opening file dialog:", e);
    return null;
  }
}

export async function loadPdfData(
  filePath: string
): Promise<ArrayBuffer | null> {
  try {
    const contents = await readFile(filePath);
    return contents.buffer as ArrayBuffer;
  } catch (e) {
    console.error(`Error reading file "${filePath}":`, e);
    return null;
  }
}
