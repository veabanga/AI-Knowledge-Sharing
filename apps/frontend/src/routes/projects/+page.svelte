<script lang="ts">
  import { onMount } from 'svelte';
  import { apiGet, type ProjectRecord } from '$lib/api';
  import { projects as demoProjects } from '$lib/demo';

  let projectList: ProjectRecord[] = [];
  let loading = true;
  let loadError = '';
  let usingDemo = false;

  async function loadProjects() {
    loading = true;
    loadError = '';
    usingDemo = false;
    try {
      projectList = await apiGet<ProjectRecord[]>('/api/projects');
    } catch (error) {
      projectList = [];
      loadError = error instanceof Error ? error.message : 'Unable to load projects.';
    } finally {
      loading = false;
    }
  }

  function loadDemoData() {
    projectList = demoProjects.map((project) => ({ ...project, description: '', employees: [] }));
    usingDemo = true;
    loadError = '';
  }

  onMount(() => {
    void loadProjects();
  });
</script>

<svelte:head>
  <title>Nexus Knowledge | Projects</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Portfolio</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">Project explorer</h2>
  </header>

  {#if loadError}
    <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div class="font-semibold">Projects could not be loaded</div>
      <div class="mt-1">{loadError}</div>
      <div class="mt-3 flex gap-2">
        <button class="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium" on:click={loadProjects}>Retry API request</button>
        <button class="rounded-lg bg-red-800 px-3 py-1.5 font-medium text-white" on:click={loadDemoData}>Use demo data</button>
      </div>
    </div>
  {/if}
  {#if usingDemo}<div class="text-sm text-amber-800">Showing demo data by explicit request.</div>{/if}

  {#if loading}
    <div role="status" class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-panel">Loading projects from the Nexus API…</div>
  {:else}
    <div class="grid gap-5">
      {#each projectList as project}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div class="text-xl font-semibold text-slate-900">{project.name}</div>
              <div class="mt-2 text-sm text-slate-600">Owner: {project.owner} · Sprint: {project.sprint}</div>
              {#if project.description}<p class="mt-2 text-sm text-slate-600">{project.description}</p>{/if}
            </div>
            <span class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">{project.progress}% complete</span>
          </div>

          <div class="mt-4 h-2 rounded-full bg-slate-100">
            <div class="h-2 rounded-full bg-teal-500" style={`width: ${project.progress}%`}></div>
          </div>

          <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Departments</div><div class="mt-2 text-sm text-slate-800">{project.departments.join(', ')}</div></div>
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Issues</div><div class="mt-2 text-sm text-slate-800">{project.issues}</div></div>
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Documents</div><div class="mt-2 text-sm text-slate-800">{project.documents}</div></div>
            <div class="rounded-xl bg-slate-50 p-3"><div class="text-xs uppercase tracking-[0.16em] text-slate-500">Risk</div><div class="mt-2 text-sm text-slate-800">{project.risk}</div></div>
          </div>
          {#if project.employees.length > 0}<div class="mt-3 text-xs text-slate-500">Project members: {project.employees.join(', ')}</div>{/if}
        </div>
      {:else}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-panel">No projects were returned by the API.</div>
      {/each}
    </div>
  {/if}
</div>
