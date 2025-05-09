// src/api.ts
// Functions for invoking Tauri backend commands.

import { invoke } from "@tauri-apps/api/core";
import type { WordEntry } from "./types"; // Import path changed to './types'

/**
 * Fetches all words from the backend database.
 * @returns A promise that resolves to an array of WordEntry objects.
 */
export async function getWords(): Promise<WordEntry[]> {
  console.log("Svelte (api.ts): Invoking get_words command...");
  try {
    const words = await invoke<WordEntry[]>("get_words");
    console.log("Svelte (api.ts): Words received from backend:", words);
    return words;
  } catch (error) {
    console.error("Svelte (api.ts): Error invoking get_words:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

// TODO: Add functions for addWordFromApi, deleteWord later
// export async function addWordFromApi(word: string): Promise<void> { ... }
// export async function deleteWord(id: number): Promise<void> { ... }
