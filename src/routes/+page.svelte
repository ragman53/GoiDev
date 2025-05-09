<script lang="ts">
  import { onMount } from "svelte";
  import { getWords } from "../api";
  import type { WordEntry } from "../types";

  let words: WordEntry[] = [];
  let isLoading = true;
  let errorMessage: string | null = null;

  onMount(async () => {
    isLoading = true;
    errorMessage = null;
    try {
      words = await getWords();
    } catch (e) {
      if (e instanceof Error) {
        errorMessage = e.message;
      } else {
        errorMessage = "An unknown error occurred while fetching words.";
      }
      console.error("Error in onMount while fetching words:", e);
    } finally {
      isLoading = false;
    }
  });
  // TODO: Add functions here later for addWord, deleteWord (which will call api.ts functions)
  // TODO: Add logic for toggling definition visibility (can be per-item state or a more complex solution)
</script>

<div class="app-container">
  <h1>Word List (Svelte Version)</h1>

  {#if isLoading}
    <p>Loading words from database...</p>
  {:else if errorMessage}
    <p style="color: red;">Error: {errorMessage}</p>
  {:else if words.length === 0}
    <p>No Words found in the database. try adding some!</p>
  {:else}
    <div id="word-list-container">
      {#each words as card (card.id)}
        <div class="word-item">
          <span class="word">{card.word}</span>
          <span class="definition">{card.definition}</span>
        </div>
      {:else}
        <p>No words to display in the list.</p>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Styles from your previous styles.css can be moved here or to a global CSS file */
  /* These are scoped to this component by default in Svelte */
  .app-container {
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    font-weight: normal;
    font-size: 1.8rem; /* Adjusted */
    padding-bottom: 1rem; /* Adjusted */
    margin-bottom: 1.5rem; /* Adjusted */
    border-bottom: 1px solid red;
  }

  #word-list-container {
    /* max-height removed for now, let the page scroll if needed */
    overflow-y: auto;
  }

  .word-item {
    padding: 1rem 0.5rem; /* Adjusted */
    border-bottom: 1px solid red;
    display: flex;
    flex-direction: column; /* Word and definition stacked */
    gap: 0.5rem;
  }

  .word {
    font-size: 1.4rem;
    font-weight: bold;
  }

  .definition {
    font-family: "Menlo", "Consolas", monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #444444;
    padding-left: 1rem;
    border-left: 2px solid #ddd;
  }

  /* .hidden { display: none; } // We'll add toggle logic later */

  /* TODO: Add styles for buttons and forms later */
</style>
