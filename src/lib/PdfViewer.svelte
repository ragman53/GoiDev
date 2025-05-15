<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    console.log("PdfViewer component has been mounted.");
  });

  function handleOpenFile() {
    alert("Open PDF functionality to be implemented!");
  }
</script>

<div class="pdf-viewer-pane">
  <h2>PDF Viewer</h2>
  <div class="pdf-content-area">
    <p>(PDF contenet will be displayed here)</p>
  </div>
  <div class="pdf-controls">
    <button on:click={handleOpenFile}>Open PDF</button>
    <button disabled>＜Prev</button> <button disabled>Next＞</button>
  </div>
</div>

<style>
  .pdf-viewer-pane {
    border-left: 2px solid red;
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fdfdfd;
    box-sizing: border-box;
  }

  .pdf-viewer-pane h2 {
    margin-top: 0;
    text-align: center;
    font-weight: normal;
    font-size: 1.5rem;
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid red;
    color: #111;
    flex-shrink: 0;
  }

  .pdf-content-area {
    flex-grow: 1;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #777;
    border: 1px dashed #ccc;
    overflow-y: auto;
  }

  .pdf-controls {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid red;
    flex-shrink: 0;
  }

  .pdf-controls button {
    font-family: inherit;
    font-size: 0.9rem;
    background: none;
    border: 1px solid red;
    color: red;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
  }

  .pdf-controls button:hover:not(:disabled) {
    background-color: rgbs(255, 0, 0, 0.05);
  }
  .pdf-controls button:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
</style>
