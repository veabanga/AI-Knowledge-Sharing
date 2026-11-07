<script lang="ts">
  import { assistantExamples, knowledgeRecords } from '$lib/demo';

  let prompt = 'What mechanical changes have affected software development?';
  let matches: typeof knowledgeRecords = [];
  let searched = false;

  function runDemoSearch() {
    const terms = prompt.toLocaleLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 3);
    matches = knowledgeRecords.filter((record) => {
      const searchable = `${record.title} ${record.type} ${record.department} ${record.project} ${record.source} ${record.owner}`.toLocaleLowerCase();
      return terms.some((term) => searchable.includes(term));
    });
    searched = true;
  }
</script>

<svelte:head>
  <title>Nexus Knowledge | AI Assistant</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Enterprise copilot</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">AI knowledge assistant</h2>
  </header>

  <div class="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div class="mb-4 text-lg font-semibold text-slate-900">Prompt examples</div>
      <div class="space-y-2">
        {#each assistantExamples as example}
          <button
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50"
            on:click={() => (prompt = example)}
          >
            {example}
          </button>
        {/each}
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <label for="assistant-prompt" class="block text-sm font-medium text-slate-700">Ask the assistant</label>
      <textarea id="assistant-prompt" bind:value={prompt} rows="4" class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"></textarea>
      <button class="mt-4 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white" on:click={runDemoSearch}>Search demo records</button>

      <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div class="text-sm font-medium text-slate-700">{searched ? 'Demo search results' : 'Demo-only search'}</div>
        <p class="mt-2 text-xs text-slate-500">This searches the small local demo fixture by keywords. It is not an LLM or RAG answer.</p>
        {#if searched}
          {#if matches.length}
            <ul class="mt-4 space-y-3">
              {#each matches as match}
                <li class="rounded-xl border border-slate-200 bg-white p-3">
                  <div class="font-medium text-slate-900">{match.title}</div>
                  <div class="mt-1 text-sm text-slate-600">{match.type} · {match.department} · {match.project}</div>
                  <div class="mt-1 text-xs text-slate-500">Source: {match.source}</div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="mt-3 text-sm text-slate-600">No matching records in the demo fixture. The demo search does not infer related concepts.</p>
          {/if}
        {:else}
          <p class="mt-3 text-sm text-slate-600">Choose an example or enter keywords, then search the local records.</p>
        {/if}
      </div>
    </div>
  </div>
</div>
