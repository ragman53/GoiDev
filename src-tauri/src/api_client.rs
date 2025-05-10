use crate::models::ApiResponseEntry;
use log::info;
use reqwest;

/// Fetches a word definition from the Dictionary API
///
/// # Arguments
///
/// * `word` - The English word to look up
///
/// # Returns
///
/// * `Ok(Some(definition))` - If the word was found with a definition
/// * `Ok(None)` - If the API returned a 404 (word not found)
/// * `Err(reqwest::Error)` - If there was a network error or API issue
pub async fn fetch_definition(word: &str) -> Result<Option<String>, reqwest::Error> {
    let api_url = format!("https://api.dictionaryapi.dev/api/v2/entries/en/{}", word);
    info!("Calling Dictionary API: {}", api_url);

    let client = reqwest::Client::new();
    let response = client.get(&api_url).send().await?;

    // Handle 404 case separately (word not found)
    if response.status() == reqwest::StatusCode::NOT_FOUND {
        return Ok(None);
    }

    // Will return error for any other non-success status
    let response = response.error_for_status()?;

    // Parse the JSON response into our model structure
    let parsed_response = response.json::<Vec<ApiResponseEntry>>().await?;

    // Navigate through the nested structure to extract the first definition
    let definition = parsed_response
        .first()
        .and_then(|entry| entry.meanings.first())
        .and_then(|meaning| meaning.definitions.first())
        .map(|def| def.definition.clone());

    Ok(definition)
}
