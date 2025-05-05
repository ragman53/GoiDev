// src-tauri/src/lib.rs

// Declare modules within the library crate
pub mod api_client;
pub mod commands;
pub mod models; // Make modules public if needed by main.rs or integration tests

// Use necessary items
use log::{error, info};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tauri::Manager;
// Import all commands from the commands module to re-export or use in handler
use commands::{add_word, add_word_from_api, delete_word, get_words};

// Type alias for the database connection pool (defined within the library)
pub type DbPool = SqlitePool; // Make it public if main.rs needs the type directly (likely not)

// Define a public function to run the application setup and execution
// This will be called by main.rs
pub fn run_app() {
    info!("Starting Tauri application from library...");

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            let db_path = "database.sqlite"; // Relative to src-tauri for dev
            let db_url = format!("sqlite:{}", db_path);
            info!("Database path: {}", db_path);

            let pool = tauri::async_runtime::block_on(async {
                info!("Connecting to database...");
                SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await
            })
            .expect("Failed to create SQLite pool.");

            info!("Database pool created successfully.");
            handle.manage(pool); // Manage the pool state
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Use the imported command functions
            get_words,
            add_word,
            delete_word,
            add_word_from_api
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
