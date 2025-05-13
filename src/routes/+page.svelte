<script lang="ts">
  import { onMount } from "svelte";
  import { getWords, deleteWord, addWordFromApi } from "$lib/api";
  import type { WordEntry } from "$lib/types";
  import WordListItem from "$lib/WordListItem.svelte";
  import AddWordForm from "$lib/AddWordForm.svelte";

  let words: WordEntry[] = [];
  let isLoading = true;
  let pageErrorMessage: string | null = null;

  // Function to load words (reused for initial load and refresh)
  async function loadWords() {
    isLoading = true;
    pageErrorMessage = null;
    try {
      words = await getWords();
    } catch (e: any) {
      pageErrorMessage =
        e.message || "An unknown error occurred while fetching words.";
      console.error("Error fetching words:", e);
    } finally {
      isLoading = false;
    }
  }

  onMount(loadWords); // Load words when component mounts

  // Callback for when AddWordForm successfully adds a word
  async function handleWordHasBeenAdded() {
    console.log("+page.svelte: Word was added! Refreshing list...");
    alert("Word added successfully! List refreshing...");
    await loadWords();
  }

  // Callback for when AddWordForm successfully adds a word
  function handleAddWordError(error: any) {
    console.error("+page.svelte: Error from AddWordForm:", error);
    const message =
      typeof error === "string"
        ? error
        : error.message || "An unknown error occurred during add.";
    pageErrorMessage = `Failed to add word: ${message}`;
  }
  // Function to handle the 'deleteRequested' event from WordListItem
  async function handleItemDeleteRequest(detail: { id: number; word: string }) {
    const { id, word } = detail;
    pageErrorMessage = null; // Clear previous errors before attempting delete
    try {
      await deleteWord(id);
      alert(`Word "${word}" (ID: ${id}) deleted successfully!`); // Replaced showSuccessMessage with alert
      await loadWords();
    } catch (e: any) {
      // Set pageErrorMessage to display the error in the HTML template
      pageErrorMessage = `Error deleting word "${word}": ${e.message || e}`;
      console.error(`Error deleting word "${word}":`, e);
    }
  }
</script>

<div class="app-container">
  <h1>Word List (Svelte Edition)</h1>

  <AddWordForm
    onWordAdded={handleWordHasBeenAdded}
    onAddError={handleAddWordError}
  />

  {#if isLoading && words.length === 0}
    <p class="loading-message">Loading words from database...</p>
  {:else if pageErrorMessage}
    <p class="error-message">Error: {pageErrorMessage}</p>
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
