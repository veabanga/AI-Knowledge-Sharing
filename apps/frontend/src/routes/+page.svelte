<script lang="ts">
  import { onMount } from 'svelte';
  import { apiGet, type DashboardOverview, type ProjectRecord } from '$lib/api';
  import { metrics as demoMetrics, projects as demoProjects, knowledgeDashboard, decisions as demoDecisions, type Metric } from '$lib/demo';

  let loading = true;
  let loadError = '';
  let usingDemo = false;
  let dashboardMetrics: Metric[] = [];
  let recentKnowledge: DashboardOverview['recentKnowledge'] = [];
  let recentDecisions: DashboardOverview['recentDecisions'] = [];
  let projectList: ProjectRecord[] = [];

  async function loadDashboard() {
    loading = true;
    loadError = '';
    usingDemo = false;
    try {
      const [overview, projects] = await Promise.all([
        apiGet<DashboardOverview>('/api/overview'),
        apiGet<ProjectRecord[]>('/api/projects')
      ]);
      dashboardMetrics = [
        { label: 'Total knowledge records', value: overview.totalKnowledgeRecords.toLocaleString(), delta: 'live API data', tone: 'teal' },
        { label: 'Active projects', value: String(overview.activeProjects), delta: 'live API data', tone: 'blue' },
        { label: 'Connected departments', value: String(overview.connectedDepartments), delta: `${overview.crossDepartmentRelationships} cross-department links`, tone: 'amber' },
        { label: 'Pending validations', value: String(overview.pendingValidations), delta: `${overview.criticalKnowledgeGaps} critical gaps`, tone: 'slate' }
      ];
      recentKnowledge = overview.recentKnowledge ?? [];
      recentDecisions = overview.recentDecisions ?? [];
      projectList = projects ?? [];
    } catch (error) {
      loadError = error instanceof Error ? error.message : 'Unable to load dashboard data.';
      dashboardMetrics = [];
      recentKnowledge = [];
      recentDecisions = [];
      projectList = [];
    } finally {
      loading = false;
    }
  }

  function loadDemoData() {
    usingDemo = true;
    loadError = '';
    dashboardMetrics = demoMetrics;
    recentKnowledge = knowledgeDashboard.map((item) => ({
      title: item.title,
      knowledgeType: item.type,
      project: item.project,
      status: item.status
    }));
    recentDecisions = demoDecisions;
    projectList = demoProjects.map((project) => ({
      ...project,
      description: '',
      employees: []
    }));
  }

  const progressStyles = (value: number) => `width: ${value}%`;

  onMount(() => {
    void loadDashboard();
  });
</script>

<svelte:head>
  <title>Nexus Knowledge | Overview</title>
</svelte:head>

<div class="space-y-8">
  <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Executive overview</p>
      <h2 class="mt-2 text-3xl font-semibold text-slate-900">Organisational memory at a glance</h2>
    </div>
    <button class="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600" disabled title="Handover generation is not implemented yet">Handover snapshot unavailable</button>
  </header>

  {#if loadError}
    <div role="alert" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div class="font-semibold">Dashboard data could not be loaded</div>
      <div class="mt-1">{loadError}</div>
      <div class="mt-3 flex gap-2">
        <button class="rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium" on:click={loadDashboard}>Retry API request</button>
        <button class="rounded-lg bg-red-800 px-3 py-1.5 font-medium text-white" on:click={loadDemoData}>Use demo data</button>
      </div>
    </div>
  {/if}
  {#if usingDemo}<div class="text-sm text-amber-800">Showing demo data by explicit request.</div>{/if}

  {#if loading}
    <div role="status" class="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-panel">Loading dashboard from the Nexus API…</div>
  {:else}
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {#each dashboardMetrics as metric}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <div class="flex items-center justify-between text-sm text-slate-500">
            <span>{metric.label}</span>
            <span class={`rounded-full px-2 py-1 text-xs font-medium ${metric.tone === 'teal' ? 'bg-teal-100 text-teal-700' : metric.tone === 'blue' ? 'bg-blue-100 text-blue-700' : metric.tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
              {metric.delta}
            </span>
          </div>
          <div class="mt-6 text-3xl font-semibold text-slate-900">{metric.value}</div>
        </div>
      {/each}
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div class="mb-5 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-slate-900">Recent knowledge capture</h3>
          <span class="text-sm text-slate-500">{usingDemo ? 'Demo data' : 'Spring Boot API'}</span>
        </div>
        <div class="space-y-4">
          {#each recentKnowledge as item}
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="text-base font-semibold text-slate-900">{item.title}</div>
                  <div class="mt-1 text-sm text-slate-500">{item.knowledgeType} · {item.project}</div>
                </div>
                <span class={`rounded-full px-2 py-1 text-xs font-medium ${item.status === 'validated' ? 'bg-emerald-100 text-emerald-700' : item.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span>
              </div>
            </div>
          {:else}
            <p class="text-sm text-slate-500">No recent knowledge records were returned.</p>
          {/each}
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <h3 class="text-xl font-semibold text-slate-900">Critical knowledge gaps</h3>
        <div class="mt-5 space-y-4">
          <div>
            <div class="mb-2 flex items-center justify-between text-sm text-slate-600"><span>Calibration documentation</span><span>72%</span></div>
            <div class="h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-teal-500" style={progressStyles(72)}></div></div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm text-slate-600"><span>Manufacturing validation trace</span><span>58%</span></div>
            <div class="h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-cyan-500" style={progressStyles(58)}></div></div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm text-slate-600"><span>Prototype handoff notes</span><span>41%</span></div>
            <div class="h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-amber-500" style={progressStyles(41)}></div></div>
          </div>
          <p class="text-xs text-slate-500">Gap progress indicators are demonstration-only and are not returned by the API.</p>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <h3 class="text-xl font-semibold text-slate-900">Projects with missing documentation</h3>
        <div class="mt-5 space-y-4">
          {#each projectList as project}
            <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div class="flex items-center justify-between">
                <div><div class="font-semibold text-slate-900">{project.name}</div><div class="mt-1 text-sm text-slate-500">Owner: {project.owner}</div></div>
                <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{project.issues} issues</span>
              </div>
              <div class="mt-3 text-sm text-slate-600">Missing-documentation assessment is demonstration-only.</div>
            </div>
          {:else}
            <p class="text-sm text-slate-500">No projects were returned.</p>
          {/each}
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <h3 class="text-xl font-semibold text-slate-900">Recent engineering decisions</h3>
        <div class="mt-5 space-y-4">
          {#each recentDecisions as decision}
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="font-medium text-slate-900">{decision.title}</div>
              <div class="mt-2 flex items-center justify-between text-sm text-slate-500"><span>{decision.project}</span><span>{decision.date}</span></div>
            </div>
          {:else}
            <p class="text-sm text-slate-500">No recent decisions were returned.</p>
          {/each}
        </div>
      </div>
    </section>
  {/if}
</div>
