// src/lib/api.ts
// (Existing imports and getWords function remain)
import { invoke } from "@tauri-apps/api/core";
import type { WordEntry } from "./types";

export async function getWords(): Promise<WordEntry[]> {
  // ... (previous code)
  console.log("Svelte (api.ts): Invoking get_words command...");
  try {
    const words = await invoke<WordEntry[]>("get_words");
    console.log("Svelte (api.ts): Words received from backend:", words);
    return words;
  } catch (error) {
    console.error("Svelte (api.ts): Error invoking get_words:", error);
    throw error;
  }
}
/**
 * Sends a word ID to the backend to delete the corresponding word entry.
 * @param id - The ID of the word to delete.
 * @returns A promise that resolves on success or rejects on error from backend.
 */
export async function deleteWord(id: number): Promise<void> {
  // Add this function
  console.log(`Svelte (api.ts): Invoking delete_word command for ID: ${id}...`);
  try {
    await invoke("delete_word", { id }); // Pass id as an object
    console.log(
      `Svelte (api.ts): delete_word command successful for ID: ${id}`
    );
  } catch (error) {
    console.error(
      `Svelte (api.ts): Error invoking delete_word for ID ${id}:`,
      error
    );
    throw error; // Re-throw to be caught by the caller
  }
}
/**
 * Sends a word to the backend to fetch its definition via API and add it to the DB.
 * @param word - The word to add to the database.
 * @returns A promise that resolves on success or rejects on error from backend.
 */
export async function addWordFromApi(word: string): Promise<void> {
  console.log(
    `Svelte (api.ts): Invoking add_word_from_api command for word: "${word}"...`
  );
  try {
    await invoke("add_word_from_api", { word });
    console.log(
      `Svelte (api.ts): add_word_from_api command successful for word: "${word}"`
    );
  } catch (error) {
    console.error(
      `Svelte (api.ts): Error invoking add_word_from_api for word "${word}":`,
      error
    );
    throw error;
  }
}
