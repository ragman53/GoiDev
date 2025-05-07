// src/ui.ts
// Functions related to updating the User Interface (DOM manipulation).

// Import the necessary type definition from api.ts
import { WordEntry } from "./api";

// We need a way to access the container. Either get it here, or pass it as argument.
// Getting it here is simpler for now if it's always the same element.
const wordListContainer = document.getElementById("word-list-container")!;
// If input clearing is also done here, get references too:
const newWordInput = document.getElementById(
  "new-word-input"
)! as HTMLInputElement;
// const newDefinitionInput = document.getElementById('new-definition-input')! as HTMLTextAreaElement; // Already removed

/**
 * Renders the list of words to the DOM inside the wordListContainer.
 * @param wordsToRender - Array of WordEntry objects to display.
 */
export function renderWordList(wordsToRender: WordEntry[]) {
  // Clear the container before rendering
  wordListContainer.innerHTML = "";

  // Display a message if no words are available
  if (wordsToRender.length === 0) {
    wordListContainer.innerHTML =
      "<p>No words found. Add some using the form above!</p>";
    return;
  }

  // Create and append list items for each word
  wordsToRender.forEach((card) => {
    const itemContainer = document.createElement("div");
    itemContainer.className = "word-item";

    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    wordSpan.textContent = card.word;

    const definitionSpan = document.createElement("span");
    definitionSpan.className = "definition hidden";
    definitionSpan.textContent = card.definition;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginLeft = "auto"; // Example style kept here for now
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "0.5rem";
    buttonContainer.style.alignItems = "center";

    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-definition-button";
    toggleButton.textContent = "Def";
    toggleButton.addEventListener("click", () => {
      definitionSpan.classList.toggle("hidden");
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Del";
    deleteButton.dataset.id = card.id.toString();
    // Note: The actual delete *logic* listener is attached in main.ts/eventListeners.ts using delegation

    buttonContainer.appendChild(toggleButton);
    buttonContainer.appendChild(deleteButton);

    itemContainer.appendChild(wordSpan);
    itemContainer.appendChild(buttonContainer);
    itemContainer.appendChild(definitionSpan);
    wordListContainer.appendChild(itemContainer);
  });
}

/**
 * Clears the new word input field.
 */
export function clearNewWordInput(): void {
  newWordInput.value = "";
}

/**
 * Shows an error message to the user (simple alert for now).
 * @param message The error message to display.
 */
export function showErrorMessage(message: string): void {
  // Replace this with a more sophisticated notification later
  alert(message);
}

/**
 * Shows a success message to the user (simple alert for now).
 * @param message The success message to display.
 */
export function showSuccessMessage(message: string): void {
  // Replace this with a more sophisticated notification later
  alert(message);
}

/**
 * Sets the loading state for the Add button.
 * @param isLoading True to show loading, false to reset.
 * @param buttonElement The button element to update.
 */
export function setAddButtonLoading(
  isLoading: boolean,
  buttonElement: HTMLButtonElement
): void {
  if (isLoading) {
    buttonElement.disabled = true;
    buttonElement.textContent = "Adding...";
  } else {
    buttonElement.disabled = false;
    buttonElement.textContent = "Add Word";
  }
}
