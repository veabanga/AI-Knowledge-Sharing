<script lang="ts">
  import { onMount } from 'svelte';
  import type { Core } from 'cytoscape';
  import { graphData, graphEdges } from '$lib/demo';

  const departmentOptions = [
    'Mechanical Engineering',
    'Electrical Engineering',
    'Software Engineering',
    'Manufacturing Engineering'
  ];
  const projectOptions = [
    'Automotive Sensor Development',
    'Embedded Sensor Software',
    'Sensor Manufacturing Integration'
  ];
  const relationshipOptions = [...new Set(graphEdges.map((edge) => edge.label))].sort();
  const nodeScopes: Record<string, { departments: string[]; projects: string[] }> = {
    'department-mechanical': { departments: ['Mechanical Engineering'], projects: ['Automotive Sensor Development', 'Sensor Manufacturing Integration'] },
    'department-electrical': { departments: ['Electrical Engineering'], projects: ['Automotive Sensor Development', 'Embedded Sensor Software'] },
    'department-software': { departments: ['Software Engineering'], projects: ['Embedded Sensor Software'] },
    'department-manufacturing': { departments: ['Manufacturing Engineering'], projects: ['Sensor Manufacturing Integration'] },
    alex: { departments: ['Mechanical Engineering'], projects: ['Automotive Sensor Development', 'Sensor Manufacturing Integration'] },
    sarah: { departments: ['Software Engineering'], projects: ['Embedded Sensor Software'] },
    michael: { departments: ['Electrical Engineering'], projects: ['Automotive Sensor Development', 'Embedded Sensor Software'] },
    david: { departments: ['Manufacturing Engineering'], projects: ['Sensor Manufacturing Integration'] },
    'project-1': { departments: ['Mechanical Engineering', 'Electrical Engineering'], projects: ['Automotive Sensor Development'] },
    'project-2': { departments: ['Software Engineering', 'Electrical Engineering'], projects: ['Embedded Sensor Software'] },
    'project-3': { departments: ['Manufacturing Engineering', 'Mechanical Engineering'], projects: ['Sensor Manufacturing Integration'] },
    'component-1': { departments: ['Mechanical Engineering'], projects: ['Automotive Sensor Development'] },
    'component-2': { departments: ['Electrical Engineering', 'Software Engineering'], projects: ['Embedded Sensor Software'] },
    'component-3': { departments: ['Manufacturing Engineering'], projects: ['Sensor Manufacturing Integration'] },
    'decision-1': { departments: ['Mechanical Engineering'], projects: ['Automotive Sensor Development'] },
    'decision-2': { departments: ['Software Engineering'], projects: ['Embedded Sensor Software'] }
  };
  const nodeDetails: Record<string, string> = {
    'component-1': 'Thermal housing component in the sensor development demo.',
    'component-2': 'PCB sensor array in the embedded software demo.',
    'component-3': 'Calibration stack tied to manufacturing integration.',
    'decision-1': 'Demo decision: composite housing selected after thermal review.',
    'decision-2': 'Demo decision: firmware timing baseline set for calibration.',
    'project-1': 'Project connects mechanical housing and electrical constraints.',
    'project-2': 'Project captures firmware calibration and sensor noise issues.',
    'project-3': 'Project captures manufacturing validation and test requirements.'
  };

  let container: HTMLDivElement;
  let cy: Core | undefined;
  let graphError = '';
  let departmentFilter = '';
  let projectFilter = '';
  let relationshipFilter = '';
  let selectedNode: { id: string; label: string; type: string } | null = null;

  function applyFilters() {
    if (!cy) return;

    cy.nodes().forEach((node) => {
      const scopes = node.data('scopes') as { departments: string[]; projects: string[] };
      const departmentMatches = !departmentFilter || scopes.departments.includes(departmentFilter);
      const projectMatches = !projectFilter || scopes.projects.includes(projectFilter);
      node.style('display', departmentMatches && projectMatches ? 'element' : 'none');
    });

    cy.edges().forEach((edge) => {
      const relationMatches = !relationshipFilter || edge.data('label') === relationshipFilter;
      const endpointsVisible = edge.source().style('display') !== 'none' && edge.target().style('display') !== 'none';
      edge.style('display', relationMatches && endpointsVisible ? 'element' : 'none');
    });
    cy.fit(cy.elements(':visible'), 36);
  }

  function fitGraph() {
    cy?.fit(cy.elements(':visible'), 36);
  }

  function zoomGraph(factor: number) {
    if (!cy) return;
    cy.zoom(Math.max(cy.minZoom(), Math.min(cy.maxZoom(), cy.zoom() * factor)));
    cy.center(cy.elements(':visible'));
  }

  onMount(() => {
    let disposed = false;
    let instance: Core | undefined;

    void import('cytoscape')
      .then(({ default: cytoscape }) => {
        if (disposed || !container) return;
        instance = cytoscape({
          container,
          elements: {
            nodes: graphData.map((node) => ({
              data: {
                id: node.id,
                label: node.label,
                type: node.type,
                group: node.group,
                scopes: nodeScopes[node.id] ?? { departments: [], projects: [] }
              }
            })),
            edges: graphEdges.map((edge, index) => ({
              data: { id: `relationship-${index}`, source: edge.source, target: edge.target, label: edge.label }
            }))
          },
          style: [
            {
              selector: 'node',
              style: {
                label: 'data(label)',
                'text-wrap': 'wrap',
                'text-max-width': '145px',
                'text-valign': 'bottom',
                'text-margin-y': 7,
                color: '#0f172a',
                'font-size': 11,
                'font-weight': 600,
                'background-color': '#8fd3ff',
                width: 34,
                height: 34,
                'border-width': 2,
                'border-color': '#1d4ed8'
              }
            },
            { selector: 'node[group = "department"]', style: { 'background-color': '#34d399', 'border-color': '#047857', width: 44, height: 44 } },
            { selector: 'node[group = "project"]', style: { 'background-color': '#60a5fa', 'border-color': '#1d4ed8', width: 40, height: 40 } },
            { selector: 'node[group = "employee"]', style: { 'background-color': '#fbbf24', 'border-color': '#b45309' } },
            { selector: 'node[group = "decision"]', style: { 'background-color': '#c4b5fd', 'border-color': '#6d28d9' } },
            { selector: 'node:selected', style: { 'border-width': 5, 'border-color': '#0f172a' } },
            {
              selector: 'edge',
              style: {
                label: 'data(label)',
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'line-color': '#94a3b8',
                'target-arrow-color': '#64748b',
                'arrow-scale': 1.1,
                width: 2,
                'font-size': 9,
                color: '#475569'
              }
            }
          ],
          layout: { name: 'cose', animate: false, padding: 45, nodeRepulsion: 6500, idealEdgeLength: 100 },
          minZoom: 0.25,
          maxZoom: 3
        });

        cy = instance;
        instance.on('tap', 'node', (event) => {
          const node = event.target;
          selectedNode = { id: node.id(), label: node.data('label'), type: node.data('type') };
        });
        instance.on('tap', (event) => {
          if (event.target === instance) selectedNode = null;
        });
        instance.one('layoutstop', () => {
          if (disposed) return;
          applyFilters();
          instance?.resize();
        });
      })
      .catch((error: unknown) => {
        graphError = error instanceof Error ? error.message : 'Cytoscape could not be initialized.';
      });

    return () => {
      disposed = true;
      instance?.destroy();
      cy = undefined;
    };
  });

  $: selectedRelations = selectedNode
    ? graphEdges.filter((edge) => edge.source === selectedNode?.id || edge.target === selectedNode?.id)
    : [];
</script>

<svelte:head>
  <title>Nexus Knowledge | Knowledge Graph</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Cross-discipline intelligence</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">Knowledge graph</h2>
  </header>

  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
    <div class="mb-4 grid gap-3 md:grid-cols-3">
      <select aria-label="Filter graph by department" bind:value={departmentFilter} on:change={applyFilters} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All departments</option>
        {#each departmentOptions as department}<option value={department}>{department}</option>{/each}
      </select>
      <select aria-label="Filter graph by project" bind:value={projectFilter} on:change={applyFilters} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All projects</option>
        {#each projectOptions as project}<option value={project}>{project}</option>{/each}
      </select>
      <select aria-label="Filter graph by relationship type" bind:value={relationshipFilter} on:change={applyFilters} class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <option value="">All relationship types</option>
        {#each relationshipOptions as relation}<option value={relation}>{relation.replaceAll('_', ' ')}</option>{/each}
      </select>
    </div>

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
        <span class="rounded-full bg-emerald-100 px-2 py-1">Department</span>
        <span class="rounded-full bg-blue-100 px-2 py-1">Project</span>
        <span class="rounded-full bg-amber-100 px-2 py-1">Employee</span>
        <span class="rounded-full bg-violet-100 px-2 py-1">Decision</span>
        <span class="rounded-full bg-slate-100 px-2 py-1">Auron Mobility demo relationships</span>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={() => zoomGraph(1 / 1.2)} aria-label="Zoom out">−</button>
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={() => zoomGraph(1.2)} aria-label="Zoom in">+</button>
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={fitGraph}>Fit to screen</button>
      </div>
    </div>

    {#if graphError}<div role="alert" class="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Graph initialization failed: {graphError}</div>{/if}
    <div bind:this={container} class="h-[520px] min-h-[520px] w-full rounded-xl border border-slate-200 bg-slate-50"></div>
    <div class="mt-2 text-xs text-slate-500">Relationships shown are part of the fictional Auron Mobility demonstration dataset.</div>
  </div>

  {#if selectedNode}
    <section aria-label="Selected graph node details" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-xs uppercase tracking-[0.16em] text-slate-500">{selectedNode.type}</div>
          <h3 class="mt-1 text-xl font-semibold text-slate-900">{selectedNode.label}</h3>
          <p class="mt-2 text-sm text-slate-600">{nodeDetails[selectedNode.id] ?? 'Auron Mobility demonstration entity.'}</p>
        </div>
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={() => (selectedNode = null)}>Close</button>
      </div>
      <div class="mt-4">
        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Related demo relationships</div>
        {#if selectedRelations.length}
          <ul class="mt-2 space-y-1 text-sm text-slate-700">
            {#each selectedRelations as relation}
              <li>{relation.label.replaceAll('_', ' ')} · {graphData.find((node) => node.id === (relation.source === selectedNode?.id ? relation.target : relation.source))?.label}</li>
            {/each}
          </ul>
        {:else}
          <p class="mt-2 text-sm text-slate-500">No linked relationships in the demo data.</p>
        {/if}
      </div>
      <p class="mt-3 text-xs text-slate-500">These relationships are demo records, not evidence from a connected enterprise source.</p>
    </section>
  {/if}
</div>
