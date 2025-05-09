// src/types.ts
// Defines the structure for a word entry, shared between frontend and backend calls.

export interface WordEntry {
  id: number; // Unique identifier from the database
  word: string; // The word itself
  definition: string; // The definition of the word
  // created_at?: string; // Optional: if you plan to use it from the DB
}
