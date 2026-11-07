<script lang="ts">
  import { onMount } from 'svelte';
  import { apiGet, type KnowledgeRecord } from '$lib/api';
  import { knowledgeRecords as demoRecords } from '$lib/demo';

  let records: KnowledgeRecord[] = [];
  let loading = true;
  let loadError = '';
  let usingDemo = false;
  let searchText = '';
  let departmentFilter = '';
  let projectFilter = '';
  let typeFilter = '';
  let validationFilter = '';

  $: departments = [...new Set(records.map((record) => record.department))].sort();
  $: projects = [...new Set(records.map((record) => record.project))].sort();
  $: types = [...new Set(records.map((record) => record.type))].sort();
  $: validations = [...new Set(records.map((record) => record.validation))].sort();
  $: filteredRecords = records.filter((record) => {
    const query = searchText.trim().toLocaleLowerCase();
    const matchesText = !query || `${record.title} ${record.description}`.toLocaleLowerCase().includes(query);
    return matchesText
      && (!departmentFilter || record.department === departmentFilter)
      && (!projectFilter || record.project === projectFilter)
      && (!typeFilter || record.type === typeFilter)
      && (!validationFilter || record.validation === validationFilter);
  });

  async function loadKnowledge() {
    loading = true;
    loadError = '';
    usingDemo = false;
    try {
      records = await apiGet<KnowledgeRecord[]>('/api/knowledge');
    } catch (error) {
      records = [];
      loadError = error instanceof Error ? error.message : 'Unable to load knowledge records.';
    } finally {
      loading = false;
    }
  }

  function loadDemoData() {
    records = demoRecords.map((record) => ({
      ...record,
      description: 'Description is not available in the original demo fixture.'
    }));
    usingDemo = true;
    loadError = '';
  }

  function clearFilters() {
    searchText = '';
    departmentFilter = '';
    projectFilter = '';
    typeFilter = '';
    validationFilter = '';
  }

  onMount(() => {
    void loadKnowledge();
  });
</script>

<svelte:head>
  <title>Nexus Knowledge | Knowledge Explorer</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Research library</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">Knowledge explorer</h2>
  </header>

  {#if loadError}
    <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div class="font-semibold">Knowledge records could not be loaded</div>
      <div class="mt-1">{loadError}</div>
      <div class="mt-3 flex gap-2">
        <button class="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium" on:click={loadKnowledge}>Retry API request</button>
        <button class="rounded-lg bg-red-800 px-3 py-1.5 font-medium text-white" on:click={loadDemoData}>Use demo data</button>
      </div>
    </div>
  {/if}
  {#if usingDemo}<div class="text-sm text-amber-800">Showing demo data by explicit request.</div>{/if}

  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
    <div class="grid gap-3 md:grid-cols-6">
      <input aria-label="Search knowledge records" bind:value={searchText} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Search title and description" />
      <select aria-label="Filter by department" bind:value={departmentFilter} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All departments</option>
        {#each departments as department}<option value={department}>{department}</option>{/each}
      </select>
      <select aria-label="Filter by project" bind:value={projectFilter} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All projects</option>
        {#each projects as project}<option value={project}>{project}</option>{/each}
      </select>
      <select aria-label="Filter by knowledge type" bind:value={typeFilter} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All types</option>
        {#each types as type}<option value={type}>{type}</option>{/each}
      </select>
      <select aria-label="Filter by validation status" bind:value={validationFilter} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All statuses</option>
        {#each validations as validation}<option value={validation}>{validation}</option>{/each}
      </select>
      <button class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700" on:click={clearFilters}>Clear filters</button>
    </div>
    <div class="mt-3 text-xs text-slate-500">{filteredRecords.length} of {records.length} records · Filters apply immediately{#if loading} · Loading…{/if}</div>
  </div>

  {#if loading}
    <div role="status" class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-panel">Loading knowledge from the Nexus API…</div>
  {:else}
    <div class="grid gap-5">
      {#each filteredRecords as item}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div class="text-xl font-semibold text-slate-900">{item.title}</div>
              <p class="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span class="rounded-full bg-slate-100 px-2 py-1">{item.type}</span>
                <span class="rounded-full bg-slate-100 px-2 py-1">{item.department}</span>
                <span class="rounded-full bg-slate-100 px-2 py-1">{item.project}</span>
              </div>
            </div>
            <span class={`rounded-full px-2.5 py-1 text-xs font-medium ${item.validation === 'validated' ? 'bg-emerald-100 text-emerald-700' : item.validation === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{item.validation}</span>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-3">
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Source</div><div class="mt-2 text-sm text-slate-800">{item.source}</div></div>
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Owner</div><div class="mt-2 text-sm text-slate-800">{item.owner}</div></div>
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Relationships</div><div class="mt-2 text-sm text-slate-800">Affects, depends on, validated by (demo graph)</div></div>
          </div>
        </div>
      {:else}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-panel">
          {#if records.length === 0}No knowledge records were returned.{:else}No records match the current search and filters.{/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
