// src/main.ts
// Import the invoke function from Tauri API to call Rust backend functions
import { invoke } from "@tauri-apps/api/core";

/**
 * Interface defining the structure of a word entry in the application
 * Each entry contains an ID, the word itself, and its definition
 * Note: created_at field is currently commented out
 */
interface WordEntry {
  id: number;
  word: string;
  definition: string;
  // created_at?: string;
}
// --- Global Variables ---
// Array to store all word entries fetched from the database or added manually
let currentWords: WordEntry[] = [];
// --- DOM Elements References ---
// Get reference to the HTML container that will display the list of words
const wordListContainer = document.getElementById("word-list-container")!;
// Get references to the new word form elements
const newWordInput = document.getElementById(
  "new-word-input"
)! as HTMLInputElement;
const newDefinitionInput = document.getElementById(
  "new-definition-input"
)! as HTMLTextAreaElement;
const addButton = document.getElementById("add-button")!;

// --- Functions ---
/**
 * Renders the list of words to the DOM
 * @param wordsToRender - Array of WordEntry objects to display
 */
function renderWordList(wordsToRender: WordEntry[]) {
  wordListContainer.innerHTML = ""; // Clear the container

  // Display a message if no words are available
  if (wordsToRender.length === 0) {
    wordListContainer.innerHTML = "<p>No words found in database.</p>";
    return;
  }

  // Iterate through each word entry and create UI elements
  wordsToRender.forEach((card) => {
    // Create container for each word item
    const itemContainer = document.createElement("div");
    itemContainer.className = "word-item";

    // Create and configure the word display element
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    wordSpan.textContent = card.word;

    // Create and configure the definition element (initially hidden)
    const definitionSpan = document.createElement("span");
    definitionSpan.className = "definition hidden";
    definitionSpan.textContent = card.definition;
    // definitionSPan.id = `definition-${card.id}`;

    // Button Container Options for good layout
    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginLeft = "auto";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "0.5rem";
    buttonContainer.style.alignItems = "center";

    // Create toggle button to show/hide the definition
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-definition-button";
    toggleButton.textContent = "Definition";
    toggleButton.addEventListener("click", () => {
      definitionSpan.classList.toggle("hidden");
    });

    // Create delete button to remove the word
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.id = card.id.toString();

    // Assemble all elements and add to the container
    buttonContainer.appendChild(toggleButton);
    buttonContainer.appendChild(deleteButton);

    itemContainer.appendChild(wordSpan);
    itemContainer.appendChild(buttonContainer);
    itemContainer.appendChild(definitionSpan);
    wordListContainer.appendChild(itemContainer);
  });
}

async function handleAddWord() {
  const newWord = newWordInput.value.trim();
  const newDefinition = newDefinitionInput.value.trim();

  if (!newWord || !newDefinition) {
    alert("Please enter both a word and a definition.");
    return;
  }

  try {
    console.log(`Attempting to invoke add_word for ${newWord}`);
    // Call the Rust backend function 'add_word' to add a new word
    await invoke("add_word", { word: newWord, definition: newDefinition });
    // If invoke succeeds (no error thrown):
    console.log(`Successfully invoked add_word for: ${newWord}`);
    alert(`Word "${newWord}" added successfully!`);
    // Clear the input fields
    newWordInput.value = "";
    newDefinitionInput.value = "";
    // --- Refresh the list from the database ---
    await loadAndRenderWords();
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Failed to add word via backend:", error);
    alert(`Error adding word: ${error}`);
  }
}
/**
 * Asynchronously loads words from the database through Tauri backend
 * and renders them to the UI
 */
async function loadAndRenderWords() {
  try {
    console.log("Attempting to load words from backend...");
    // Call the Rust backend function 'get_words' to fetch words
    const wordsFromDb = await invoke<WordEntry[]>("get_words");
    // Store fetched words in the global variable
    currentWords = wordsFromDb;
    // Render the words to the UI
    renderWordList(currentWords);
    console.log("Words loaded from backend:", currentWords);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Failed to load words from backend:", error);
    wordListContainer.innerHTML = `<p style="color: red;">Error loading words: ${error}</p>`;
  }
}

// --- Event Listeners ---

// Add event listener to the 'Add Word' button, calling handleAddWord on click
addButton.addEventListener("click", handleAddWord);

// Use event delegation to handle delete button clicks
wordListContainer.addEventListener("click", async (event) => {
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
    if (!window.confirm(`Are you sure you want to delete "${wordText}"?`)) {
      return;
    }
    try {
      console.log(`Attempting to invoke delete_word for ID: ${wordId}`);
      await invoke("delete_word", { id: wordId });

      console.log(`Successfully invoked delete_word for ID: ${wordId}`);
      alert(`Word "${wordText}" deleted successfully!`);
      // Refresh the list from the database
      await loadAndRenderWords();
    } catch (error) {
      console.error("Failed to delete word via backend:", error);
      alert(`Error deleting word: ${error}`);
    }
  }
});
// --- Initialisation ---
// Load words from backend when the script runs
loadAndRenderWords();
