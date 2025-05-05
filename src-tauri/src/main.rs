// src-tauri/src/main.rs

// Prevents additional console window on Windows in release mode, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Import the run_app function using the library name specified in Cargo.toml's [lib] section
use goidev_lib::run_app; // Use the name from `[lib] name = "goidev_lib"`

// Entry point for the binary executable
fn main() {
    // Call the imported run_app function
    run_app();
}
