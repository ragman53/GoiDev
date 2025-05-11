// src-tauri/src/models.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// Represents a word entry in the database with its definition.
/// This struct maps directly to the database schema.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct WordEntry {
    /// Database primary key (INTEGER PRIMARY KEY AUTOINCREMENT)
    pub id: i64,
    /// The word itself (TEXT NOT NULL UNIQUE)
    pub word: String,
    /// The definition of the word (TEXT NOT NULL)
    pub definition: String,
    // Commented out field:
    // created_at: Option<chrono::DateTime<chrono::Utc>>,
}

/// Represents a single definition with an optional example.
/// Used in API responses for dictionary lookups.
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ApiDefinition {
    /// The actual definition text
    pub definition: String,
    /// Optional example usage of the word in this definition context
    pub example: Option<String>,
    // Potential future fields:
    // pub synonyms: Vec<String>,
    // pub antonyms: Vec<String>,
}

/// Represents a group of definitions for a specific part of speech.
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ApiMeaning {
    /// Collection of definitions for this part of speech
    #[serde(rename = "partOfSpeech")]
    pub definitions: Vec<ApiDefinition>,
    // Potential future fields:
    // pub synonyms: Vec<String>,
    // pub antonyms: Vec<String>,
}

/// Represents a complete dictionary entry from the API response.
/// Contains the word and its various meanings.
#[derive(Deserialize, Debug, Clone)]
pub struct ApiResponseWordEntry {
    /// The word being defined
    pub word: String,
    /// Various meanings/usages of the word grouped by part of speech
    pub meanings: Vec<ApiMeaning>,
    // Potential future field:
    // pub phonetics: Vec<ApiPhonetic>,
}

/// Represents pronunciation information for a word.
#[derive(Deserialize, Debug, Clone)]
pub struct ApiPhonetic {
    /// Textual representation of pronunciation (e.g., /həˈləʊ/)
    pub text: Option<String>,
    /// URL to audio file with pronunciation
    pub audio: Option<String>,
}
