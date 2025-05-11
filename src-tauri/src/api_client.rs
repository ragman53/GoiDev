// src-tauri/src/api_client.rs
use crate::models::{ApiMeaning, ApiResponseWordEntry};
use log::info;
use reqwest;

/// Fetches rich definition data from the Free Dictionary API.
///
/// This function makes an HTTP request to the Dictionary API to retrieve
/// comprehensive information about a word, including all of its meanings
/// and parts of speech.
///
/// # Arguments
/// * `word` - The English word to look up in the dictionary.
///
/// # Returns
/// * `Ok(Some(Vec<ApiMeaning>))` - Successfully retrieved and parsed definitions.
/// * `Ok(None)` - Word not found (API returned 404) or no meanings were present in the response.
/// * `Err(reqwest::Error)` - Network error, API error, or JSON parsing failure.
///

pub async fn fetch_definition(word: &str) -> Result<Option<Vec<ApiMeaning>>, reqwest::Error> {
    let api_url = format!("https://api.dictionaryapi.dev/api/v2/entries/en/{}", word);
    info!("Calling Dictionary API: {}", api_url);

    let client = reqwest::Client::new();
    let response = client.get(&api_url).send().await?;

    // Check for 404 status (word not found in dictionary)
    if response.status() == reqwest::StatusCode::NOT_FOUND {
        info!("API returned 404 for word: {}", word);
        return Ok(None);
    }

    // Propagate error for any other non-success status codes
    let response = response.error_for_status()?;

    // Parse the JSON response into our structured data model
    let api_response_entries = response.json::<Vec<ApiResponseWordEntry>>().await?;

    if let Some(first_entry) = api_response_entries.first() {
        if !first_entry.meanings.is_empty() {
            info!(
                "Successfully parsed {} meanings for word: {}",
                first_entry.meanings.len(),
                word
            );
            return Ok(Some(first_entry.meanings.clone()));
        }
    }

    // API response was valid but contained no meanings
    info!("No meanings found in API response for word: {}", word);
    Ok(None)
}
