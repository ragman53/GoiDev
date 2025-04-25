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
  // created_at: string;
}

// Array to store all word entries fetched from the database
let currentWords: WordEntry[] = [];

// Get reference to the HTML container that will display the word list
const wordListContainer = document.getElementById("word-list-container")!;

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

    // Create toggle button to show/hide the definition
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-definition-button";
    toggleButton.textContent = "Def";
    toggleButton.addEventListener("click", () => {
      definitionSpan.classList.toggle("hidden");
    });

    // Assemble all elements and add to the container
    itemContainer.appendChild(wordSpan);
    itemContainer.appendChild(toggleButton);
    itemContainer.appendChild(definitionSpan);
    wordListContainer.appendChild(itemContainer);
  });
}

/**
 * Asynchronously loads words from the database through Tauri backend
 * and renders them to the UI
 */
async function loadAndRenderWords() {
  try {
    // Call the Rust backend function to get words from database
    const words = await invoke<WordEntry[]>("get_words");
    // Store fetched words in the global variable
    currentWords = words;
    // Render the words to the UI
    renderWordList(currentWords);
    console.log("Words loaded from database:", currentWords);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Failed to load words from database:", error);
    wordListContainer.innerHTML = `<p style="color: red;">Error loading words: ${error}</p>`;
  }
}

// Initialize the application by loading and displaying words
loadAndRenderWords();
