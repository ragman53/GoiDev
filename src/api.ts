/**
 * This module contains functions for interacting with the Tauri backend commands.
 * It provides a typed interface to the backend functionality through the invoke API.
 */

import { invoke } from "@tauri-apps/api/core";

/**
 * Represents a dictionary word entry in the application.
 */
export interface WordEntry {
  /** Unique identifier for the word entry */
  id: number;
  /** The word/term itself */
  word: string;
  /** The definition or meaning of the word */
  definition: string;
  // created_at?: string; // Timestamp field - might be added in future versions
}

/**
 * Fetches all words from the backend database.
 *
 * @returns A promise that resolves to an array of WordEntry objects.
 * @throws Will throw an error if the backend command fails.
 */
export async function getWords(): Promise<WordEntry[]> {
  console.log("api.ts: Invoking get_words...");
  return await invoke<WordEntry[]>("get_words");
}

/**
 * Adds a new word to the dictionary by fetching its definition from an external API.
 *
 * @param word - The word to add to the dictionary.
 * @returns A promise that resolves on successful addition or rejects on error.
 * @throws Will throw an error if the word cannot be added or the API request fails.
 */
export async function addWordFromApi(word: string): Promise<void> {
  console.log(`api.ts: Invoking add_word_from_api for "${word}"...`);
  await invoke("add_word_from_api", { word });
}

/**
 * Removes a word from the dictionary by its unique identifier.
 *
 * @param id - The ID of the word entry to delete.
 * @returns A promise that resolves on successful deletion or rejects on error.
 * @throws Will throw an error if the deletion fails or the ID doesn't exist.
 */
export async function deleteWord(id: number): Promise<void> {
  console.log(`api.ts: Invoking delete_word for ID: ${id}...`);
  await invoke("delete_word", { id });
}
