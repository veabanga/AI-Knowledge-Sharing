<script lang="ts">
  const integrations = [
    { name: 'Jira', status: 'mock connection active', details: 'Issue retrieval, sprint sync, and changelog extraction are simulated and labelled as such in the UI.' },
    { name: 'Confluence', status: 'planned', details: 'Doc-backed design narratives and architecture decisions are queued for the next integration layer.' },
    { name: 'SharePoint', status: 'planned', details: 'Document ingestion supports future controlled access and document classification policies.' }
  ];
</script>

<svelte:head>
  <title>Nexus Knowledge | Integrations</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Platform connectivity</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">Integrations</h2>
  </header>

  <div class="grid gap-5">
    {#each integrations as integration}
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div class="flex items-center justify-between gap-4">
          <div class="text-xl font-semibold text-slate-900">{integration.name}</div>
          <span class={`rounded-full px-2.5 py-1 text-xs font-medium ${integration.status === 'mock connection active' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
            {integration.status}
          </span>
        </div>
        <div class="mt-3 text-sm leading-6 text-slate-600">{integration.details}</div>
      </div>
    {/each}
  </div>
</div>
