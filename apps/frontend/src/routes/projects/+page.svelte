<script lang="ts">
  import { base } from '$app/paths';
  import { knowledgeDepartments, knowledgeProjects, knowledgeRecords } from '$lib/knowledge';
</script>

<svelte:head>
  <title>Nexus Knowledge | Demo Projects</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Auron Mobility · Fictional demo portfolio</p>
    <h1 class="mt-2 text-3xl font-semibold text-slate-900">Engineering projects</h1>
    <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">These project groupings organize the curated browser-side knowledge dataset. They are illustrative and are not connected to a project system.</p>
  </header>
  <div class="grid gap-4 md:grid-cols-2">
    {#each knowledgeProjects as project}
      {@const projectRecords = knowledgeRecords.filter((record) => record.project === project)}
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div class="text-lg font-semibold text-slate-900">{project}</div>
        <div class="mt-3 text-sm text-slate-600">{projectRecords.length} curated knowledge records</div>
        <div class="mt-3 flex flex-wrap gap-2">{#each [...new Set(projectRecords.map((record) => record.department))] as department}<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{department}</span>{/each}</div>
        <a class="mt-5 inline-flex text-sm font-semibold text-teal-800 hover:text-teal-950" href={`${base}/discovery/`}>Explore related knowledge →</a>
      </article>
    {/each}
  </div>
  <p class="text-xs text-slate-500">Departments represented: {knowledgeDepartments.join(' · ')}</p>
</div>
