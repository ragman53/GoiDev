<script lang="ts">
  import { onMount } from "svelte";
  import { getWords, deleteWord, addWordFromApi } from "$lib/word-api";
  import type { WordEntry } from "$lib/types";
  import WordListItem from "$lib/WordListItem.svelte";
  import AddWordForm from "$lib/AddWordForm.svelte";
  import PdfViewer from "$lib/PdfViewer.svelte";

  let words: WordEntry[] = [];
  let isLoadingWords = true;
  let pageErrorMessage: string | null = null;

  // --- Lifecycle Functions ---
  /**
   * onMount: Svelte lifecycle function that runs once when the component is first mounted.
   * Used here to load the initial list of words from the database.
   */
  onMount(async () => {
    await loadWords();
  });

  // Function to load words (reused for initial load and refresh)
  async function loadWords() {
    isLoadingWords = true;
    pageErrorMessage = null;
    try {
      console.log("+page.selte: Fetching words...");
      words = await getWords();
      console.log("+page.svelte: words fetched successfully.", words);
    } catch (e: any) {
      const message =
        e.message || "An unknown error occurred while fetching words.";
      pageErrorMessage = message;
      console.error("+page.svelte: Error fetching words:", e);
    } finally {
      isLoadingWords = false;
    }
  }

  // Callback for when AddWordForm successfully adds a word
  async function handleWordHasBeenAdded() {
    console.log(
      "+page.svelte: 'onWordAdded' callback triggered. Refreshing list..."
    );
    // alert("Word added successfully! List refreshing...");
    await loadWords();
  }

  /**
   * Callback function passed to AddWordForm.
   * Called when an error occurs during the word addition process in AddWordForm.
   * @param error - The error object or message from AddWordForm.
   */
  function handleAddWordError(error: any) {
    console.error("+page.svelte: 'onAddError' callback triggered:", error);
    const message =
      typeof error === "string"
        ? error
        : error?.message || "Unknown error adding word.";
    pageErrorMessage = `Failed to add word: ${message}`;
  }

  /**
   * Callback function passed to WordListItem.
   * Called when a delete request is initiated from a WordListItem component.
   * @param detail - An object containing the id and word of the item to be deleted.
   */
  async function handleItemDelete(detail: { id: number; word: string }) {
    const { id, word } = detail;
    pageErrorMessage = null; // Clear previous errors
    console.log(
      `+page.svelte: 'onDeleteRequested' callback for ID: ${id}, Word: ${word}`
    );
    try {
      await deleteWord(id);
      console.log(`+page.svelte: Word "${word}" (ID: ${id}) deleted via API.`);
      // alert(`Word "${word}" (ID: ${id}) deleted successfully!`); // Using page status instead
      await loadWords(); // Refresh the list
    } catch (e: any) {
      const message =
        e.message || `An unknown error occurred while deleting "${word}".`;
      pageErrorMessage = `Error deleting word "${word}": ${message}`;
      console.error(`+page.svelte: Error deleting word "${word}":`, e);
    }
  }
</script>

<div class="main-layout-container">
  <div class="word-list-pane">
    <h1>Word List</h1>
    <AddWordForm
      onWordAdded={handleWordHasBeenAdded}
      onAddError={handleAddWordError}
    />

    {#if isLoadingWords && words.length === 0}
      <p class="status-message loading">Loading words...</p>
    {:else if pageErrorMessage}
      <p class="status-message error">Error: {pageErrorMessage}</p>
    {:else if words.length === 0}
      <p class="status-message info">
        No words found. Add some using the form above!
      </p>
    {:else}
      <div class="word-list-scroll-container">
        {#each words as card (card.id)}
          <WordListItem wordEntry={card} onDeleteRequested={handleItemDelete} />
        {/each}
      </div>
    {/if}
  </div>

  <div class="pdf-viewer-pane-wrapper">
    <PdfViewer />
  </div>
</div>

<style>
  /* Styles for the main two-pane layout and page-specific elements */
  .main-layout-container {
    display: flex;
    flex-direction: row; /* Side-by-side panes */
    height: 100vh; /* Full viewport height */
    width: 100vw; /* Full viewport width */
    overflow: hidden; /* Prevent scrollbars on the layout container itself */
    box-sizing: border-box;
    background-color: #fff; /* Base background for the app */
  }

  .word-list-pane {
    flex: 1 1 40%; /* Adjusted flex basis, can be tuned */
    min-width: 300px; /* Minimum width for the word list pane */
    padding: 1rem;
    overflow-y: hidden; /* Let child scroll container handle scroll */
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .pdf-viewer-pane-wrapper {
    flex: 1 1 60%; /* Adjusted flex basis */
    min-width: 350px; /* Minimum width for the PDF viewer pane */
    overflow: hidden;
    display: flex; /* To make PdfViewer component fill height */
    box-sizing: border-box;
    /* The red border is now on the left of PdfViewer.svelte */
  }

  .word-list-pane h1 {
    text-align: center;
    font-weight: normal;
    font-size: 1.5rem; /* Consistent title size */
    padding-bottom: 0.75rem;
    margin: 0 0 1rem 0;
    border-bottom: 1px solid red;
    color: #111;
    flex-shrink: 0;
  }

  /* Container for the actual list of words, to enable scrolling within the pane */
  .word-list-scroll-container {
    flex-grow: 1; /* Takes available vertical space */
    overflow-y: auto; /* Enables scrolling for the list itself */
    padding-right: 0.5rem; /* Space for scrollbar if needed, adjust for OS */
    margin-top: 1rem; /* Space below AddWordForm */
  }

  /* Common styling for status messages */
  .status-message {
    text-align: center;
    padding: 1rem;
    font-size: 1rem;
    flex-shrink: 0;
    border: 1px solid transparent; /* Base for consistent spacing */
  }
  .status-message.loading {
    color: #555;
  }
  .status-message.info {
    color: #333;
  }
  .status-message.error {
    color: red;
    border-color: red;
    background-color: #ffeeee;
    padding: 0.75rem;
  }
</style>
