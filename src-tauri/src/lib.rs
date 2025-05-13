// src-tauri/src/lib.rs

// Declare modules within the library crate
pub mod api_client;
pub mod commands;
pub mod models;

// Import dependencies
use std::error::Error; // For the Error trait and Box<dyn Error>
use std::fs;
// use std::path::PathBuf; // This might be unused now if not explicitly typed elsewhere

use log::{error, info};
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use tauri::{App, Manager}; // Explicitly import App

// Import command handlers
use commands::{add_word, add_word_from_api, delete_word, get_words};

/// Type alias for the SQLite connection pool
pub type DbPool = SqlitePool;

/// Main application entry point
pub fn run_app() {
    // Initialize logger (example using env_logger)
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    info!("env_logger initialized (with builder)...");
    info!("Starting Tauri application from library...");

    tauri::Builder::default()
        // Corrected setup closure signature and error boxing
        .setup(|app: &mut App| -> Result<(), Box<dyn Error + 'static>> { // Return type changed
            let handle = app.handle();

            let app_data_dir = handle.path().app_data_dir().map_err(|tauri_err| {
                let err_msg = format!(
                    "Failed to get application data directory path (check bundle identifier?): {}",
                    tauri_err
                );
                error!("{}", err_msg);
                Box::from(err_msg) as Box<dyn Error + 'static> // Adjusted error type
            })?;
            
            info!("Resolved app data directory: {:?}", app_data_dir);

            if !app_data_dir.exists() {
                info!("App data directory does not exist. Creating: {:?}", app_data_dir);
                fs::create_dir_all(&app_data_dir).map_err(|io_err| {
                    let err_msg = format!("Failed to create app data directory at {:?}: {}", app_data_dir, io_err);
                    error!("{}", err_msg);
                    // std::io::Error implements Error, so Box::new can be used
                    Box::new(io_err) as Box<dyn Error + 'static> // Adjusted error type
                })?;
                info!("Successfully created app data directory.");
            } else {
                info!("App data directory already exists: {:?}", app_data_dir);
            }

            let db_path = app_data_dir.join("database.sqlite");
            
            let db_url_str = db_path.to_str().ok_or_else(|| {
                let err_msg = format!("Database path {:?} contains non-UTF-8 characters.", db_path);
                error!("{}", err_msg);
                Box::from(err_msg) as Box<dyn Error + 'static> // Adjusted error type
            })?;

            let db_url = format!("sqlite:{}?mode=rwc", db_url_str); 
            
            info!("Database full file path: {:?}", db_path);
            info!("Database connection URL: {}", db_url);

            let pool = tauri::async_runtime::block_on(async {
                info!("Attempting to connect to database and create pool...");
                SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await
            })
            .map_err(|sqlx_err: sqlx::Error| { 
                error!("Failed to connect/create SQLite pool at {}: {:?}", db_url, sqlx_err);
                Box::new(sqlx_err) as Box<dyn Error + 'static> // Adjusted error type
            })?; 
            
            info!("Database pool created successfully.");

            let pool_clone_for_table_creation = pool.clone();
            tauri::async_runtime::block_on(async move {
                info!("Checking and creating 'words' table if it doesn't exist...");
                let create_table_sql = r#"
                    CREATE TABLE IF NOT EXISTS words (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        word TEXT NOT NULL UNIQUE,
                        definition TEXT NOT NULL,
                        created_at TEXT DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
                    );
                "#;
                match sqlx::query(create_table_sql)
                    .execute(&pool_clone_for_table_creation)
                    .await
                {
                    Ok(_) => info!("'words' table check/creation successful."),
                    Err(e) => error!("Failed to create 'words' table: {:?}. This might prevent the app from working correctly.", e),
                }
            });

            handle.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_words,
            add_word,
            delete_word,
            add_word_from_api
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}