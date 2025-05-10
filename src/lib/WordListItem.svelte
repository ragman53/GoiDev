<script lang="ts">
  import type { WordEntry } from "./types";

  export let wordEntry: WordEntry;
  let isDefinitionVisible = false;

  export let onDeleteRequested: (detail: { id: number; word: string }) => void;

  function toggleDefinition() {
    isDefinitionVisible = !isDefinitionVisible;
  }

  // Handles the click on the delete button
  function handleDeleteClick() {
    // Optional: Confirm with the user before deleting
    if (
      window.confirm(`Are you sure you want to delete "${wordEntry.word}"?`)
    ) {
      if (onDeleteRequested) {
        onDeleteRequested({
          id: wordEntry.id,
          word: wordEntry.word,
        });
      }
    }
  }
</script>

<div class="word-item">
  <div class="word-header">
    <span class="word">{wordEntry.word}</span>
    <div class="buttons">
      <button class="toggle-definition-button" on:click={toggleDefinition}>
        {isDefinitionVisible ? "Hide Def" : "Show Def"}
      </button>
      <!-- Add the delete button and its click handler -->
      <button class="delete-button" on:click={handleDeleteClick}> Del </button>
    </div>
  </div>

  {#if isDefinitionVisible}
    <div class="definition-wrapper">
      <span class="definition">{wordEntry.definition}</span>
    </div>
  {/if}
</div>

<style>
  /* Styles scoped to this WordListItem component */
  .word-item {
    padding: 1rem 0.5rem; /* Vertical padding, horizontal padding */
    border-bottom: 1px solid red; /* Red line separator */
    display: flex;
    flex-direction: column; /* Stack header and definition vertically */
    gap: 0.5rem; /* Space between header and definition block */
  }
  .word-item:last-child {
    border-bottom: none; /* No border for the last item in a list */
  }

  .word-header {
    display: flex; /* Arrange word and buttons in a row */
    justify-content: space-between; /* Pushes buttons to the right */
    align-items: center; /* Align items vertically */
    gap: 1rem; /* Space between word and buttons container */
  }

  .word {
    font-size: 1.5rem;
    font-weight: bold;
    color: #111;
    flex-grow: 1; /* Allow word to take available space */
    word-break: break-word; /* Prevent long words from overflowing */
  }

  .buttons {
    display: flex;
    gap: 0.5rem; /* Space between buttons, if multiple */
    flex-shrink: 0; /* Prevent buttons from shrinking */
  }

  .toggle-definition-button /*, .delete-button (for future) */ {
    font-family: inherit;
    font-size: 0.8rem;
    background: none;
    border: 1px solid red;
    color: red;
    padding: 0.3rem 0.7rem; /* Slightly adjusted padding */
    cursor: pointer;
    transition: none; /* No transition for brutalist style */
    white-space: nowrap; /* Prevent button text from wrapping */
  }
  .toggle-definition-button:hover /*, .delete-button:hover */ {
    background-color: rgba(255, 0, 0, 0.05); /* Softer hover */
  }

  .definition-wrapper {
    /* Optional: if you want to style the block containing the definition */
    margin-top: 0.25rem; /* Small space above definition if it's visible */
  }

  .definition {
    font-family: "Menlo", "Consolas", "Courier New", monospace;
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
    padding-left: 1em; /* Indent definition */
    /* border-left: 2px solid #ddd; // Optional border, you can re-add if you like */
    white-space: pre-wrap; /* Preserve whitespace and newlines in definition text */
  }

  .delete-button {
    font-family: inherit;
    font-size: 0.8rem;
    background: none;
    border: 1px solid #888; /* Example: Grey border */
    color: #555; /* Example: Grey text */
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    transition: none;
  }
  .delete-button:hover {
    background-color: #f0f0f0;
    border-color: #555;
  }
</style>
