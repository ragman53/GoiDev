<script lang="ts">
  import type { WordEntry, ApiMeaning } from "./types";

  // Component props
  export let wordEntry: WordEntry; // The word entry data containing word, definition, etc.
  export let onDeleteRequested: (detail: { id: number; word: string }) => void; // Callback function when word deletion is requested

  // Local state
  let isDefinitionVisible = false; // Controls whether definition section is expanded
  let parsedMeanings: ApiMeaning[] | null = null; // Holds parsed definition data when available
  let parsingError: string | null = null; // Captures any JSON parsing errors

  /**
   * Toggles the visibility of the definition section and parses JSON definition
   * data if needed when expanding for the first time
   */
  function toggleDefinition() {
    isDefinitionVisible = !isDefinitionVisible;

    // Only parse definition when showing for the first time
    if (isDefinitionVisible && !parsedMeanings && !parsingError) {
      try {
        parsedMeanings = JSON.parse(wordEntry.definition) as ApiMeaning[];
        if (!Array.isArray(parsedMeanings) || parsedMeanings.length === 0) {
          parsingError = "No structured definition found.";
          parsedMeanings = null;
        }
      } catch (e) {
        console.error("Error parsing definition JSON:", e);
        parsingError = "Failed to parse definition data.";
        parsedMeanings = null;
      }
    }
  }

  /**
   * Handles deletion of a word entry with user confirmation
   */
  function handleDeleteClick() {
    if (
      window.confirm(`Are you sure you want to delete "${wordEntry.word}"?`)
    ) {
      onDeleteRequested({
        id: wordEntry.id,
        word: wordEntry.word,
      });
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
      <button class="delete-button" on:click={handleDeleteClick}> Del </button>
    </div>
  </div>

  {#if isDefinitionVisible}
    <div class="definition-wrapper">
      {#if parsingError}
        <p class="parse-error">Error: {parsingError}</p>
      {:else if parsedMeanings && parsedMeanings.length > 0}
        {#each parsedMeanings as meaning (meaning.partOfSpeech)}
          <div class="meaning-block">
            <h4 class="part-of-speech">{meaning.partOfSpeech}</h4>
            <ul class="definitions-list">
              {#each meaning.definitions as defItem, i (defItem.definition + i)}
                <li>
                  <span class="definition-text">{defItem.definition}</span>
                  {#if defItem.example}
                    <span class="example-text"
                      ><em>Example:</em> {defItem.example}</span
                    >
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      {:else}
        <p>No definition details available.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Styles scoped to this WordListItem component */
  .word-item {
    padding: 1rem 0.5rem;
    border-bottom: 1px solid red;
    display: flex;
    flex-direction: column;
    gap: 0.75rem; /* Increased gap for better spacing */
  }
  .word-item:last-child {
    border-bottom: none;
  }

  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .word {
    font-size: 1.6rem; /* Slightly larger word */
    font-weight: bold;
    color: #111;
    flex-grow: 1;
    word-break: break-word;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .toggle-definition-button,
  .delete-button {
    font-family: inherit;
    font-size: 0.8rem;
    background: none;
    border: 1px solid red;
    color: red;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    transition: none;
    white-space: nowrap;
  }
  .toggle-definition-button:hover,
  .delete-button:hover {
    background-color: rgba(255, 0, 0, 0.05);
  }
  .delete-button {
    border-color: #888;
    color: #555;
  }
  .delete-button:hover {
    background-color: #f0f0f0;
    border-color: #555;
  }

  .definition-wrapper {
    margin-top: 0.5rem; /* Space above the definition block */
    padding-left: 0.5em; /* Indent the whole definition block slightly */
  }

  .meaning-block {
    margin-bottom: 0.75rem; /* Space between different parts of speech */
  }

  .part-of-speech {
    font-weight: bold;
    font-size: 1.1rem;
    color: #d00000; /* Red for part of speech */
    margin-bottom: 0.25rem;
    display: block;
  }

  .definitions-list {
    list-style-type: decimal; /* Numbered definitions */
    padding-left: 1.5em; /* Indent for numbers */
    margin: 0;
  }

  .definitions-list li {
    margin-bottom: 0.5rem; /* Space between definitions */
  }

  .definition-text {
    font-family: "Menlo", "Consolas", "Courier New", monospace;
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
  }

  .example-text {
    display: block; /* Put example on a new line */
    font-style: italic;
    font-size: 0.9rem;
    color: #555;
    margin-left: 1em; /* Indent example further */
  }

  .parse-error {
    color: #cc0000;
    font-style: italic;
  }
</style>
