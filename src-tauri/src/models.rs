use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// Define a struct to represent a word entry in the database
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct WordEntry {
    pub id: i64,      // Database primary key (INTEGER PRIMARY KEY AUTOINCREMENT)
    pub word: String, // The word (TEXT NOT NULL UNIQUE)
    pub definition: String, // The definition of the word (TEXT NOT NULL)
                      // created_at: Option<chrono::DateTime<chrono::Utc>>,
}

// Represents the top-level structure of the dictionary API response
#[derive(Deserialize, Debug, Clone)]
pub struct ApiResponseEntry {
    pub meanings: Vec<Meaning>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Meaning {
    pub definitions: Vec<Definition>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct Definition {
    pub definition: String,
}
