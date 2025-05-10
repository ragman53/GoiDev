<script lang="ts">
  import { onMount } from "svelte";
  import { getWords, deleteWord } from "$lib/api"; // Import deleteWord
  import type { WordEntry } from "$lib/types";
  import WordListItem from "$lib/WordListItem.svelte";

  let words: WordEntry[] = [];
  let isLoading = true;
  let errorMessage: string | null = null;

  // Function to load words (reused for initial load and refresh)
  async function loadWords() {
    isLoading = true;
    errorMessage = null;
    try {
      words = await getWords();
    } catch (e: any) {
      errorMessage = e.message || "An unknown error occurred.";
      console.error("Error fetching words:", e);
    } finally {
      isLoading = false;
    }
  }

  onMount(loadWords); // Load words when component mounts

  // This function will be passed as a prop to WordListItem
  // Its signature now matches the expected callback prop
  async function handleItemDeleteRequest(detail: { id: number; word: string }) {
    const { id, word } = detail;
    console.log(`Delete requested for ID: ${id}, Word: ${word}`);

    isLoading = true;
    try {
      await deleteWord(id);
      console.log(`Word "${word}" (ID: ${id}) deleted successfully.`);
      await loadWords();
    } catch (e: any) {
      errorMessage = `Error deleting word "${word}": ${e.message || e}`;
      console.error(`Error deleting word "${word}":`, e);
    } finally {
      isLoading = false;
    }
  }

  // TODO: AddWordForm component and its logic
</script>

<div class="app-container">
  <h1>Word List (Svelte Edition)</h1>

  {#if isLoading && words.length === 0}
    <p class="loading-message">Loading words from database...</p>
  {:else if errorMessage}
    <p class="error-message">Error: {errorMessage}</p>
  {:else if words.length === 0}
    <p class="info-message">No words found in the database. Try adding some!</p>
  {:else}
    <div class="word-list-container">
      {#each words as card (card.id)}
        <WordListItem
          wordEntry={card}
          onDeleteRequested={handleItemDeleteRequest}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .app-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  h1 {
    text-align: center;
    font-weight: normal;
    font-size: 1.8rem;
    padding-bottom: 1rem;
    margin: 2rem 0 1.5rem 0;
    border-bottom: 2px solid red;
    color: #111;
  }

  .loading-message,
  .error-message,
  .info-message {
    text-align: center;
    padding: 1rem;
    font-size: 1.1rem;
  }
  .error-message {
    color: red;
    border: 1px solid red;
    background-color: #ffeeee;
  }

  .word-list-container {
    /* Specific styles for the container of WordListItems, if any */
  }
</style>
