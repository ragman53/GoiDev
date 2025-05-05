use crate::DbPool;
use crate::api_client::fetch_definition; // Import function from our api_client module
use crate::models::WordEntry; // Import struct from our models module
use log::{error, info}; // For logging
use sqlx::{self, SqlitePool}; // Import SqlitePool directly
use tauri::State; // For accessing managed state // Use the DbPool type alias defined in main.rs (or move alias definition)

#[tauri::command]
pub async fn get_words(pool: tauri::State<'_, DbPool>) -> Result<Vec<WordEntry>, String> {
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

/// Takes a word, fetches its definition from the Free Dictionary API,
/// and adds it to the database.
#[tauri::command]
pub async fn add_word_from_api(word: String, pool: State<'_, DbPool>) -> Result<(), String> {
    info!("Attempting to add word from '{}' using API", word);
    let definition = match fetch_definition(&word).await {
        Ok(Some(def)) => {
            info!("Definition found for '{}': {}", word, def);
            def // Return the definition if found
        }
        Ok(None) => {
            let msg = format!("Definition not found via API for word: {}", word);
            info!("{}", msg);
            return Err(msg); // Return an error if the word was not found
        }
        Err(e) => {
            error!("Error fethcing definition for '{}': {}", word, e);
            return Err(format!("API Error for '{}': {}", word, e));
        }
    };
    info!(
        "Attempting to save'{}' with fetched definition to DB.",
        word
    );
    let sql = "INSERT INTO words (word, definition) VALUES (?, ?)";
    match sqlx::query(sql)
        .bind(word.clone())
        .bind(definition)
        .execute(&*pool)
        .await
    {
        Ok(result) => {
            info!(
                "Word '{}' added successfully to DB. Rows affected: {}",
                word,
                result.rows_affected()
            );
            Ok(())
        }
        Err(e) => {
            error!("Failed to add word '{}' to DB: {:?}", word, e);
            if let Some(db_err) = e.as_database_error() {
                if db_err.is_unique_violation() {
                    return Err(format!("Word '{}' already exists in the database.", word));
                }
            }
            Err(format!("Failed to save word '{}' to database: {}", word, e))
        }
    }
}

/// Adds a new word to the database.
#[tauri::command]
pub async fn add_word(
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
pub async fn delete_word(id: i64, pool: tauri::State<'_, DbPool>) -> Result<(), String> {
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
