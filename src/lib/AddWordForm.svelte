<script lang="ts">
  import { addWordFromApi } from "./api";

  // Props to handle events after word addition or errors
  export let onWordAdded: () => void;
  export let onAddError: (error: any) => void;

  // Form state variables
  let newWord: string = "";
  let isLoading: boolean = false;
  let localErrorMessage: string | null = null;

  /**
   * Handles the form submission process:
   * 1. Validates input
   * 2. Submits to API
   * 3. Handles success/error cases
   */
  async function handleSubmit() {
    // Form validation
    if (!newWord.trim()) {
      localErrorMessage = "Please enter a word";
      return;
    }

    isLoading = true;
    localErrorMessage = null;

    try {
      await addWordFromApi(newWord.trim());
      // Call the callback if provided
      if (onWordAdded) {
        onWordAdded();
      }
      newWord = ""; // Reset the form after successful submission
    } catch (error: any) {
      console.error("AddWordForm: Error adding word:", error);
      // Format error message for display
      const message =
        typeof error === "string"
          ? error
          : error.message || "An unknown error occurred.";
      localErrorMessage = message;
      // Call the error callback if provided
      if (onAddError) {
        onAddError(error);
      }
    } finally {
      isLoading = false; // Always reset loading state
    }
  }
</script>

<div class="add-word-form-container">
  <h2>Add New Word (via API)</h2>
  <form on:submit|preventDefault={handleSubmit} class="form-fields">
    <input
      type="text"
      bind:value={newWord}
      placeholder="Enter word (definition fetched automatically)"
      disabled={isLoading}
    />
    <!-- Input field with two-way binding, disabled during API requests -->
    <button type="submit" disabled={isLoading}>
      {#if isLoading}
        Adding...
      {:else}
        Add Word
      {/if}
    </button>
  </form>
  {#if localErrorMessage}
    <p class="error-message-form">{localErrorMessage}</p>
  {/if}
</div>

<style>
  .add-word-form-container {
    padding: 1rem 0.5rem;
    border-bottom: 1px solid red; /* 値を追加 */
    margin-bottom: 1.5rem; /* 親ページとの間隔調整 */
  }

  .add-word-form-container h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #111;
  }

  .form-fields {
    /* ← .form-fields のスタイル定義を追加 */
    display: flex;
    gap: 0.75rem;
    align-items: center; /* これで入力欄とボタンが縦方向に中央揃えになります */
  }

  .form-fields input[type="text"] {
    font-family: inherit;
    font-size: 1rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid #111;
    background-color: #fff;
    color: #111;
    flex-grow: 1; /* 入力欄が可能な限り幅を取るように */
    min-width: 200px;
    box-sizing: border-box;
  }

  .form-fields button {
    font-family: inherit;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.5rem 1rem; /* inputの高さと合わせるためにpadding調整 */
    border: 2px solid red;
    background-color: #fff;
    color: red;
    cursor: pointer;
    transition: none;
    white-space: nowrap;
    flex-shrink: 0; /* ボタンが縮まないように */
  }

  .form-fields button:hover:not(:disabled) {
    background-color: rgba(255, 0, 0, 0.05);
  }

  .form-fields button:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }

  .error-message-form {
    color: red;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
</style>
