// Prevents additional console window on Windows in release mode, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Importing necessary crates and modules
use log::{error, info};
use serde::{Deserialize, Serialize}; // For serializing and deserializing data structures
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions}; // For SQLite database connection pooling
use tauri::Manager; // For managing the Tauri application state and app handle // For standardized logging

// Define a struct to represent a word entry in the database
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
struct WordEntry {
    id: i64,      // Database primary key (INTEGER PRIMARY KEY AUTOINCREMENT)
    word: String, // The word (TEXT NOT NULL UNIQUE)
    definition: String, // The definition of the word (TEXT NOT NULL)
                  // TODO: Uncomment and implement `created_at` if tracking word addition timestamps is required in the future
                  // created_at: Option<chrono::DateTime<chrono::Utc>>,
}

// Type alias for the SQLite database connection pool
type DbPool = SqlitePool;

/// Fetches all words from the database and returns them as a vector of `WordEntry`.
#[tauri::command]
async fn get_words(pool: tauri::State<'_, DbPool>) -> Result<Vec<WordEntry>, String> {
    info!("Fetching words from database..."); // Log message for debugging

    // Execute a SQL query to fetch all words and map the results to the `WordEntry` struct
    let words =
        sqlx::query_as::<_, WordEntry>("SELECT id, word, definition FROM words ORDER BY id ASC")
            .fetch_all(&*pool) // Fetch all rows from the query
            .await // Await the asynchronous operation
            .map_err(|e| {
                error!("Error fetching words: {:?}", e); // Log error if query fails
                e.to_string() // Convert the error to a string for the Result
            })?;
    info!("Successfully fetched {} words.", words.len()); // Log the number of words fetched
    Ok(words) // Return the fetched words
}

/// Adds a new word to the database.
#[tauri::command]
async fn add_word(
    word: String,
    definition: String,
    pool: tauri::State<'_, DbPool>,
) -> Result<(), String> {
    info!("Attempting to add word: '{}'", word); // Log the word being added
    let sql = "INSERT INTO words (word, definition) VALUES (?, ?)"; // SQL query to insert a new word
    // Execute the SQL query with the provided word and definition
    match sqlx::query(sql)
        .bind(word.clone())
        .bind(definition)
        .execute(&*pool)
        .await
    {
        Ok(result) => {
            info!(
                "Word '{}' added successfully. Rows affected: {}",
                word,
                result.rows_affected()
            ); // Log success message
            Ok(()) // Return Ok if the word was added successfully
        }
        Err(e) => {
            error!("Failed to add word '{}': {:?}", word, e);
            Err(format!("Failed to add word '{}': {:?}", word, e)) // Return an error if the insertion fails 
        }
    }
}

#[tauri::command]
async fn delete_word(id: i64, pool: tauri::State<'_, DbPool>) -> Result<(), String> {
    info!("Attempting to delete word with ID: {}", id);
    let sql = "DELETE FROM words WHERE id = ?";

    match sqlx::query(sql).bind(id).execute(&*pool).await {
        Ok(result) => {
            if result.rows_affected() > 0 {
                info!("Successfully deleted word with ID: {}", id);
                Ok(())
            } else {
                let err_msg = format!("Word with ID {} not found for deletion.", id);
                error!("{}", err_msg);
                Err(err_msg) // Return an error if the word was not found
            }
        }
        Err(e) => {
            error!("Failed to delete word with ID {}: {:?}", id, e);
            Err(format!("Failed to delete word with ID {}: {:?}", id, e)) // Return an error if the deletion fails
        }
    }
}
// Entry point of the Tauri application
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Setup function to initialize resources asynchronously
            let handle = app.handle(); // Get the app handle for managing the app state
            let db_path = "database.sqlite"; // Path to the SQLite database file
            let db_url = format!("sqlite:{}", db_path); // Construct the database URL
            // Create a SQLite connection pool using `sqlx`
            let pool = tauri::async_runtime::block_on(async {
                SqlitePoolOptions::new()
                    .max_connections(5) // Set the maximum number of connections in the pool
                    .connect(&db_url) // Connect to the database
                    .await
            })
            .expect("Failed to create SQLite pool."); // Panic if the connection pool cannot be created

            // Store the database pool in the app state
            handle.manage(pool);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_words, add_word, delete_word]) // Register the `get_words` command
        .run(tauri::generate_context!()) // Run the Tauri application
        .expect("error while running tauri application"); // Panic if the app fails to run
}
