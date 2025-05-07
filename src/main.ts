// src/main.ts (Refactored)
// Main application entry point and event listener setup.

// Import functions from our modules
import { getWords, addWordFromApi, deleteWord } from "./api";
import {
  renderWordList,
  clearNewWordInput,
  showErrorMessage,
  showSuccessMessage,
  setAddButtonLoading,
} from "./ui";

// --- DOM Element References (kept in main for event listeners) ---
const wordListContainer = document.getElementById("word-list-container")!;
const newWordInput = document.getElementById(
  "new-word-input"
)! as HTMLInputElement;
// const newDefinitionInput = document.getElementById('new-definition-input')! as HTMLTextAreaElement; // Removed
const addButton = document.getElementById("add-button")!;

// --- Functions ---

/**
 * Loads words from the backend and renders them. Handles initial load and refreshes.
 */
async function loadAndRender() {
  try {
    console.log("main.ts: Loading words...");
    const words = await getWords(); // Use API module
    renderWordList(words); // Use UI module
    console.log("main.ts: Words rendered.");
  } catch (error) {
    console.error("main.ts: Failed to load and render words:", error);
    showErrorMessage(`Error loading words: ${error}`); // Use UI module
  }
}

/**
 * Handles the 'Add Word' button click event.
 */
async function handleAddWordClick() {
  const newWord = newWordInput.value.trim();
  if (!newWord) {
    showErrorMessage("Please enter a word."); // Use UI module
    return;
  }

  setAddButtonLoading(true, addButton); // Use UI module

  try {
    await addWordFromApi(newWord); // Use API module
    showSuccessMessage(`Word "${newWord}" added successfully!`); // Use UI module
    clearNewWordInput(); // Use UI module
    await loadAndRender(); // Refresh the list after successful add
  } catch (error) {
    console.error(`main.ts: Failed to add word "${newWord}":`, error);
    showErrorMessage(
      `Error adding word "<span class="math-inline">\{newWord\}"\:\\n</span>{error}`
    ); // Use UI module
  } finally {
    setAddButtonLoading(false, addButton); // Use UI module
  }
}

/**
 * Handles clicks within the word list container (for delete buttons).
 * Uses event delegation.
 * @param event The click event object.
 */
async function handleWordListClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.classList.contains("delete-button")) {
    const wordIdString = target.dataset.id;
    if (!wordIdString) {
      console.error("Delete button clicked, but no ID found.");
      return;
    }
    const wordId = parseInt(wordIdString, 10);

    const wordText =
      target.closest(".word-item")?.querySelector(".word")?.textContent ||
      "this word";
    // Use built-in confirm for simplicity, could be replaced by custom UI later
    if (
      !window.confirm(
        `Are you sure you want to delete "${wordText}" (ID: ${wordId})?`
      )
    ) {
      return; // Stop if user cancels
    }

    try {
      await deleteWord(wordId); // Use API module
      showSuccessMessage(`Word "${wordText}" deleted successfully!`); // Use UI module
      await loadAndRender(); // Refresh the list
    } catch (error) {
      console.error(`main.ts: Failed to delete word (ID: ${wordId}):`, error);
      showErrorMessage(`Error deleting word: ${error}`); // Use UI module
    }
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  addButton.addEventListener("click", handleAddWordClick);
  wordListContainer.addEventListener("click", handleWordListClick);
  console.log("main.ts: Event listeners set up.");
}

// --- Initialisation ---
/**
 * Initializes the application.
 */
async function initializeApp() {
  setupEventListeners();
  await loadAndRender(); // Load initial data
  console.log("main.ts: Application initialized.");
}

// Start the application initialization process
initializeApp();
