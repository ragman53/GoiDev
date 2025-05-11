// src/lib/types.ts

/**
 * Represents a definition for a word with an optional example
 */
export interface ApiDefinition {
  /** The textual definition */
  definition: string;
  /** Optional usage example demonstrating the word in context */
  example?: string;
}

/**
 * Represents a meaning of a word, including its part of speech and definitions
 */
export interface ApiMeaning {
  /**
   * Grammatical category of the word (noun, verb, adjective, etc.)
   * Note: in Rust, it's part_of_speech, but serde renames it for JSON
   */
  partOfSpeech: string;
  /** Collection of definitions for this meaning */
  definitions: ApiDefinition[];
}

/**
 * Represents a dictionary entry for a word
 */
export interface WordEntry {
  /** Unique database identifier */
  id: number;
  /** The word itself */
  word: string;
  /** Complete definition of the word */
  definition: string;
  // /** Timestamp when the entry was created in the database */
  // created_at?: string;
}
