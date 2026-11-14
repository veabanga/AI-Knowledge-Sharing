<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { Bookmark, BookmarkCheck, Check, ChevronDown, ChevronRight, Copy, Search, X } from 'lucide-svelte';
  import {
    knowledgeDepartments,
    knowledgeProjects,
    knowledgeTypes,
    suggestedSearches
  } from '$lib/knowledge';
  import { knowledgeStore } from '$lib/knowledge-store';
  import { searchKnowledge } from '$lib/search';
  import { tourAction, tourState } from '$lib/tour';

  const storageKey = 'nexus-knowledge-investigation-v1';
  let query = suggestedSearches[0];
  let departmentFilter = '';
  let projectFilter = '';
  let typeFilter = '';
  let selectedId = '';
  let savedIds: string[] = [];
  let copyMessage = '';
  let storageMessage = '';

  $: filteredResults = searchKnowledge($knowledgeStore, query).filter(({ record }) =>
    (!departmentFilter || record.department === departmentFilter)
    && (!projectFilter || record.project === projectFilter)
    && (!typeFilter || record.type === typeFilter)
  );
  $: selectedRecord = selectedId ? $knowledgeStore.find((record) => record.id === selectedId) : undefined;
  $: savedRecords = savedIds.map((id) => $knowledgeStore.find((record) => record.id === id)).filter((record) => record !== undefined);

  const guidedQuery = 'Our redesigned sensor housing is overheating near the PCB during extended operation. Has another team encountered this?';

  onMount(() => {
    const recordFromUrl = $page.url.searchParams.get('record');
    if (recordFromUrl && $knowledgeStore.some((record) => record.id === recordFromUrl)) {
      query = $knowledgeStore.find((record) => record.id === recordFromUrl)?.title ?? query;
      selectedId = recordFromUrl;
    }
    const unsubscribeAction = tourAction.subscribe((action) => {
      if (action === 'run-example-search') {
        query = guidedQuery;
        selectedId = '';
      } else if (action === 'open-top-result') {
        selectedId = filteredResults[0]?.record.id ?? '';
      } else if (action === 'open-created-record' && $tourState.createdRecordId) {
        const record = $knowledgeStore.find((candidate) => candidate.id === $tourState.createdRecordId);
        if (record) {
          query = record.title;
          selectedId = record.id;
        }
      } else if (action === 'close-detail') {
        selectedId = '';
      }
      if (action) tourAction.set(null);
    });
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (Array.isArray(stored) && stored.every((id) => typeof id === 'string')) {
        savedIds = stored.filter((id) => $knowledgeStore.some((record) => record.id === id));
      } else {
        storageMessage = 'Saved investigations could not be read because the stored data has an unexpected format.';
      }
    } catch (error) {
      storageMessage = error instanceof Error
        ? `Saved investigations could not be read: ${error.message}`
        : 'Saved investigations could not be read from this browser.';
    }

    return unsubscribeAction;
  });

  function isSaved(id: string) {
    return savedIds.includes(id);
  }

  function toggleSaved(id: string) {
    const next = isSaved(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      savedIds = next;
      storageMessage = '';
    } catch (error) {
      storageMessage = error instanceof Error
        ? `Could not update saved investigations: ${error.message}`
        : 'Could not update saved investigations in this browser.';
    }
  }

  async function copySolution() {
    if (!selectedRecord) return;
    const summary = `${selectedRecord.title}\n\nProblem: ${selectedRecord.problem}\n\nRoot cause: ${selectedRecord.rootCause}\n\nSolution: ${selectedRecord.solution}\n\nValidation: ${selectedRecord.validation.status} — ${selectedRecord.validation.summary}\n\nSource: ${selectedRecord.sources.map((source) => `${source.title} (${source.reference})`).join('; ')}`;
    try {
      await navigator.clipboard.writeText(summary);
      copyMessage = 'Solution summary copied.';
    } catch (error) {
      copyMessage = error instanceof Error
        ? `Copy was unavailable: ${error.message}`
        : 'Copy was unavailable in this browser.';
    }
  }

  function clearFilters() {
    query = '';
    departmentFilter = '';
    projectFilter = '';
    typeFilter = '';
  }
</script>

<svelte:head>
  <title>Nexus Knowledge | Knowledge Discovery</title>
  <meta name="description" content="Discover and reuse fictional Auron Mobility engineering knowledge across projects." />
</svelte:head>

<div class="mx-auto max-w-[1500px] space-y-6">
  <header class="rounded-3xl bg-navy px-6 py-7 text-white shadow-panel md:px-9 md:py-9">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Cross-project engineering knowledge</p>
        <h1 class="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Your engineering organisation has solved this problem before. Find out how.</h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Search previous problems, root causes, validated solutions and lessons across Auron Mobility teams and projects.</p>
      </div>
      <div class="shrink-0 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <div class="font-medium text-white">Prototype retrieval engine</div>
        <div class="mt-1 text-xs text-slate-300">Local, explainable search · No LLM or API</div>
      </div>
    </div>
  </header>

  {#if storageMessage}
    <div role="alert" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{storageMessage}</div>
  {/if}

  <section data-tour="discovery-search" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel md:p-5" aria-label="Search and filter engineering knowledge">
    <label for="knowledge-query" class="mb-2 block text-sm font-semibold text-slate-800">Describe the engineering problem</label>
    <div class="flex flex-col gap-3 md:flex-row">
      <div class="relative min-w-0 flex-1">
        <Search size={18} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input id="knowledge-query" bind:value={query} class="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100" placeholder="e.g. Our sensor housing is overheating near the PCB…" />
      </div>
      <button class="min-h-11 w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 md:w-auto" on:click={() => (selectedId = filteredResults[0]?.record.id ?? '')}>Find related knowledge</button>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <span class="mr-1 text-xs font-medium text-slate-500">Try a search:</span>
      {#each suggestedSearches as suggestion}
        <button class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900" on:click={() => (query = suggestion)}>{suggestion}</button>
      {/each}
    </div>

    <details class="mt-5 border-t border-slate-100 pt-3" open>
      <summary class="flex cursor-pointer list-none items-center gap-2 py-1 text-sm font-semibold text-slate-700"><ChevronDown size={16} />Filters<span class="text-xs font-normal text-slate-500">(apply immediately)</span></summary>
    <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <label class="text-xs font-medium text-slate-600">Department
        <select bind:value={departmentFilter} class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          <option value="">All departments</option>
          {#each knowledgeDepartments as department}<option value={department}>{department}</option>{/each}
        </select>
      </label>
      <label class="text-xs font-medium text-slate-600">Project
        <select bind:value={projectFilter} class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          <option value="">All projects</option>
          {#each knowledgeProjects as project}<option value={project}>{project}</option>{/each}
        </select>
      </label>
      <label class="text-xs font-medium text-slate-600">Knowledge type
        <select bind:value={typeFilter} class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          <option value="">All types</option>
          {#each knowledgeTypes as type}<option value={type}>{type}</option>{/each}
        </select>
      </label>
      <button class="self-end rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" on:click={clearFilters}>Clear filters</button>
    </div>
    </details>
  </section>

  <div class={`grid items-start gap-5 ${selectedRecord ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]' : ''}`}>
    <section aria-label="Search results" class="min-w-0 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">{query.trim() ? 'Relevant engineering knowledge' : 'Browse engineering knowledge'}</h2>
          <p class="mt-1 text-xs text-slate-500">{filteredResults.length} matching {filteredResults.length === 1 ? 'record' : 'records'} · Ranked by field-weighted relevance</p>
        </div>
        <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">Fictional Auron Mobility data</span>
      </div>

      {#each filteredResults as result, index (result.record.id)}
        <article data-tour={index === 0 ? 'top-search-result' : undefined} class={`min-w-0 rounded-2xl border bg-white p-4 shadow-panel transition md:p-5 ${selectedId === result.record.id ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300'}`}>
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">#{index + 1} match</span>
                <span class={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${result.record.validation.status === 'Validated' ? 'bg-emerald-100 text-emerald-800' : result.record.validation.status === 'Unresolved' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{result.record.validation.status}</span>
                <span class="text-xs text-slate-500">{result.record.type}</span>
              </div>
              <button class="mt-3 text-left text-lg font-semibold leading-snug text-slate-900 hover:text-teal-800" on:click={() => { selectedId = result.record.id; copyMessage = ''; }}>
                {result.record.title}
              </button>
              <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{result.record.problem}</p>
              <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>{result.record.project}</span><span>{result.record.department}</span>
              </div>
              {#if result.matchedFields.length}
                <div class="mt-3 flex flex-wrap items-center gap-1.5">
                  <span class="mr-1 text-[11px] font-medium text-slate-500">Matched in</span>
                  {#each result.matchedFields as field}<span class="rounded-md bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-800">{field}</span>{/each}
                </div>
              {/if}
            </div>
            <button class="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-teal-800" aria-label={isSaved(result.record.id) ? 'Remove from my investigation' : 'Save to my investigation'} title={isSaved(result.record.id) ? 'Remove from my investigation' : 'Save to my investigation'} on:click={() => toggleSaved(result.record.id)}>
              {#if isSaved(result.record.id)}<BookmarkCheck size={18} class="text-teal-700" />{:else}<Bookmark size={18} />{/if}
            </button>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span class="text-xs text-slate-500">Root cause: {result.record.rootCause}</span>
            <button class="flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-950" on:click={() => { selectedId = result.record.id; copyMessage = ''; }}>View details <ChevronRight size={16} /></button>
          </div>
        </article>
      {:else}
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          {#if query.trim()}
            <div class="text-base font-semibold text-slate-800">No related knowledge found</div>
            <p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Try describing the symptom differently, remove a filter, or use one of the suggested searches above.</p>
          {:else}
            <div class="text-base font-semibold text-slate-800">No records match these filters</div>
            <p class="mt-2 text-sm text-slate-500">Clear filters to browse all Auron Mobility demo knowledge.</p>
          {/if}
        </div>
      {/each}

      {#if savedRecords.length}
        <section class="mt-6 rounded-2xl border border-teal-100 bg-teal-50/60 p-4" aria-label="My investigation">
          <div class="flex items-center justify-between gap-3">
            <div><h2 class="font-semibold text-slate-900">My investigation</h2><p class="mt-1 text-xs text-slate-600">Saved in this browser · {savedRecords.length} {savedRecords.length === 1 ? 'record' : 'records'}</p></div>
            <BookmarkCheck size={20} class="text-teal-700" />
          </div>
          <ul class="mt-3 space-y-2">
            {#each savedRecords as record (record.id)}
              <li class="flex items-center gap-2 rounded-xl border border-teal-100 bg-white px-3 py-2">
                <button class="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800 hover:text-teal-800" on:click={() => { selectedId = record.id; copyMessage = ''; }}>{record.title}</button>
                <button class="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label={`Remove ${record.title} from my investigation`} on:click={() => toggleSaved(record.id)}><X size={15} /></button>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    </section>

    {#if selectedRecord}
      <aside data-tour="knowledge-detail-panel" aria-label="Knowledge record details" class="fixed inset-0 z-40 min-w-0 overflow-y-auto rounded-none border border-slate-200 bg-white shadow-panel lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:rounded-2xl">
        <div class="sticky top-0 z-10 rounded-t-2xl border-b border-slate-100 bg-white/95 p-4 backdrop-blur md:p-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2"><span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">{selectedRecord.type}</span><span class="text-xs text-slate-500">{selectedRecord.id}</span></div>
              <h2 class="mt-2 text-xl font-semibold leading-snug text-slate-900">{selectedRecord.title}</h2>
              <p class="mt-1 text-xs leading-5 text-slate-500">{selectedRecord.project} · {selectedRecord.department}</p>
            </div>
            <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close knowledge details" on:click={() => (selectedId = '')}><X size={18} /></button>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button class="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800" on:click={() => toggleSaved(selectedRecord.id)}>
              {#if isSaved(selectedRecord.id)}<BookmarkCheck size={15} />Remove from investigation{:else}<Bookmark size={15} />Save to my investigation{/if}
            </button>
            <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" on:click={copySolution}><Copy size={14} />Copy solution summary</button>
          </div>
          {#if copyMessage}<div class="mt-2 flex items-center gap-1 text-xs text-slate-600" role="status"><Check size={14} />{copyMessage}</div>{/if}
        </div>

        <div class="space-y-5 p-4 md:p-5">
          {#if selectedRecord.sourceType === 'Manual contribution'}
            <div class="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900">Manual contribution · stored only in this browser</div>
          {/if}
          <section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Original problem</h3><p class="mt-2 text-sm leading-6 text-slate-800">{selectedRecord.problem}</p></section>
          {#if selectedRecord.detailedContext}<section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Detailed context</h3><p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">{selectedRecord.detailedContext}</p></section>{/if}
          <section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Root cause</h3><p class="mt-2 text-sm leading-6 text-slate-800">{selectedRecord.rootCause}</p></section>
          <section class="rounded-xl border border-teal-100 bg-teal-50/70 p-4"><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-teal-900">Previously identified solution</h3><p class="mt-2 text-sm leading-6 text-slate-800">{selectedRecord.solution}</p></section>
          {#if selectedRecord.stepsTaken}<section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Steps taken</h3><p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{selectedRecord.stepsTaken}</p></section>{/if}
          <section>
            <div class="flex items-center justify-between gap-2"><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Validation evidence</h3><span class={`rounded-full px-2 py-1 text-[11px] font-semibold ${selectedRecord.validation.status === 'Validated' ? 'bg-emerald-100 text-emerald-800' : selectedRecord.validation.status === 'Unresolved' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{selectedRecord.validation.status}</span></div>
            <p class="mt-2 text-sm leading-6 text-slate-700">{selectedRecord.validation.summary}</p>
          </section>
          <section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Lessons learned</h3><p class="mt-2 text-sm leading-6 text-slate-700">{selectedRecord.lessons}</p></section>
          {#if selectedRecord.recommendations}<section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Reusable recommendations</h3><p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{selectedRecord.recommendations}</p></section>{/if}
          {#if selectedRecord.investigation || selectedRecord.attemptedApproaches || selectedRecord.unsuccessfulApproaches || selectedRecord.blocker || selectedRecord.supportNeeded || selectedRecord.nextSteps}
            <section class="rounded-xl border border-amber-100 bg-amber-50/70 p-4"><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-amber-900">Open investigation</h3><div class="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              {#if selectedRecord.investigation}<p><strong>Investigated:</strong> {selectedRecord.investigation}</p>{/if}
              {#if selectedRecord.attemptedApproaches}<p><strong>Approaches attempted:</strong> {selectedRecord.attemptedApproaches}</p>{/if}
              {#if selectedRecord.unsuccessfulApproaches}<p><strong>What did not work:</strong> {selectedRecord.unsuccessfulApproaches}</p>{/if}
              {#if selectedRecord.blocker}<p><strong>Current blocker:</strong> {selectedRecord.blocker}</p>{/if}
              {#if selectedRecord.supportNeeded}<p><strong>Support needed:</strong> {selectedRecord.supportNeeded}</p>{/if}
              {#if selectedRecord.nextSteps}<p><strong>Suggested next steps:</strong> {selectedRecord.nextSteps}</p>{/if}
              {#if selectedRecord.relatedDepartments?.length}<p><strong>Teams to involve:</strong> {selectedRecord.relatedDepartments.join(', ')}</p>{/if}
            </div></section>
          {/if}

          <dl class="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
            <div><dt class="text-slate-500">Department</dt><dd class="mt-1 font-medium text-slate-800">{selectedRecord.department}</dd></div>
            <div><dt class="text-slate-500">Project</dt><dd class="mt-1 font-medium text-slate-800">{selectedRecord.project}</dd></div>
            <div><dt class="text-slate-500">Component</dt><dd class="mt-1 font-medium text-slate-800">{selectedRecord.component}</dd></div>
            <div><dt class="text-slate-500">Author</dt><dd class="mt-1 font-medium text-slate-800">{selectedRecord.author}</dd></div>
            <div><dt class="text-slate-500">Created</dt><dd class="mt-1 font-medium text-slate-800">{selectedRecord.createdAt}</dd></div>
            <div><dt class="text-slate-500">Last updated</dt><dd class="mt-1 font-medium text-slate-800">{selectedRecord.updatedAt}</dd></div>
          </dl>

          <section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Related engineering issues</h3>
            <ul class="mt-2 space-y-2">{#each selectedRecord.relatedIssues as issue}<li class="rounded-lg border border-slate-200 p-3"><span class="font-mono text-xs font-semibold text-teal-800">{issue.id}</span><p class="mt-1 text-sm text-slate-700">{issue.title}</p></li>{/each}</ul>
          </section>
          <section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Related knowledge</h3>
            {#if selectedRecord.relatedRecordIds.length}
              <ul class="mt-2 space-y-2">{#each selectedRecord.relatedRecordIds as relatedId}{@const relatedRecord = $knowledgeStore.find((record) => record.id === relatedId)}{#if relatedRecord}<li><button class="group flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-left hover:border-teal-300 hover:bg-teal-50" on:click={() => { selectedId = relatedRecord.id; copyMessage = ''; }}><span class="min-w-0"><span class="block text-sm font-medium text-slate-800 group-hover:text-teal-900">{relatedRecord.title}</span><span class="mt-1 block text-xs text-slate-500">{relatedRecord.department} · {relatedRecord.project}</span></span><ChevronRight size={16} class="shrink-0 text-slate-400" /></button></li>{/if}{/each}</ul>
            {:else}<p class="mt-2 text-sm text-slate-500">No related records are listed.</p>{/if}
          </section>
          <section><h3 class="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Evidence & provenance</h3>
            <p class="mt-2 text-xs leading-5 text-slate-600">{selectedRecord.sourceType === 'Manual contribution' ? 'Manually contributed in this browser. Evidence references are user-provided and have not been independently verified.' : 'Fictional Auron Mobility demonstration content. Source references below are illustrative and are not links to real company systems.'}</p>
            {#if selectedRecord.contributorName}<p class="mt-2 text-xs text-slate-600">Contributed by {selectedRecord.contributorName}{#if selectedRecord.occurredAt} · Occurred {selectedRecord.occurredAt}{/if}</p>{/if}
            <ul class="mt-3 space-y-2">{#each selectedRecord.sources as source}<li class="rounded-lg bg-slate-50 p-3"><div class="text-sm font-medium text-slate-800">{source.title}</div><div class="mt-1 text-xs text-slate-500">{source.kind} · {source.reference}</div></li>{/each}</ul>
          </section>
          <div class="flex flex-wrap gap-1">{#each selectedRecord.tags as tag}<span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{tag}</span>{/each}</div>
        </div>
      </aside>
    {/if}
  </div>

  <footer class="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 md:flex-row md:items-center">
    <p>All records, teams, issue identifiers and source references are fictional and created for the Auron Mobility demo.</p>
    <a class="font-semibold text-teal-800 hover:text-teal-950" href={`${base}/graph/`}>Explore the sample knowledge graph <span aria-hidden="true">→</span></a>
  </footer>
</div>
