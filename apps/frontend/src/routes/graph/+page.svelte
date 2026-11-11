<script lang="ts">
  import { onMount } from 'svelte';
  import { tick } from 'svelte';
  import type { Core } from 'cytoscape';
  import {
    graphData,
    graphEdges,
    graphNodeKnowledge as nodeKnowledge,
    graphNodeScopes as nodeScopes,
    knowledgeDepartments as departmentOptions,
    knowledgeProjects as projectOptions,
    type GraphKnowledge
  } from '$lib/graph-data';

  const relationshipOptions = [...new Set(graphEdges.map((edge) => edge.label))].sort();
  type SelectedNode = GraphKnowledge & {
    id: string;
    label: string;
    type: string;
    department: string;
    project: string;
  };

  let container: HTMLDivElement;
  let cy: Core | undefined;
  let graphError = '';
  let departmentFilter = '';
  let projectFilter = '';
  let relationshipFilter = '';
  let selectedNode: SelectedNode | null = null;

  function selectNode(id: string) {
    const node = graphData.find((item) => item.id === id);
    if (!node) return;
    const scopes = nodeScopes[id];
    const details = nodeKnowledge[id];
    selectedNode = {
      id,
      label: node.label,
      type: node.type,
      ...details,
      department: scopes.departments.join(', ') || 'Not specified',
      project: scopes.projects.join(', ') || 'Not specified'
    };
    cy?.nodes().unselect();
    cy?.$id(id).select();
    applyHighlights();
    void tick().then(() => cy?.resize());
  }

  function clearSelection() {
    selectedNode = null;
    cy?.nodes().unselect();
    applyHighlights();
    void tick().then(() => cy?.resize());
  }

  function applyHighlights() {
    if (!cy) return;
    cy.elements().removeClass('dimmed highlighted selected-node');
    if (!selectedNode) return;
    const selected = cy.$id(selectedNode.id);
    const connectedEdges = selected.connectedEdges();
    const connectedNodes = connectedEdges.connectedNodes();
    cy.elements().addClass('dimmed');
    selected.removeClass('dimmed').addClass('selected-node');
    connectedNodes.removeClass('dimmed');
    connectedEdges.removeClass('dimmed').addClass('highlighted');
  }

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
    applyHighlights();
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
                'text-max-width': '90px',
                'text-valign': 'bottom',
                'text-margin-y': 7,
                color: '#0f172a',
                'font-size': 8,
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
            { selector: 'node[group = "knowledge"]', style: { 'background-color': '#99f6e4', 'border-color': '#0f766e', width: 38, height: 38 } },
            { selector: 'node[type = "Problem"]', style: { 'background-color': '#fda4af', 'border-color': '#be123c' } },
            { selector: 'node[type = "Solution"]', style: { 'background-color': '#6ee7b7', 'border-color': '#047857' } },
            { selector: 'node[type = "Decision"]', style: { 'background-color': '#c4b5fd', 'border-color': '#6d28d9' } },
            { selector: 'node[type = "Lesson"]', style: { 'background-color': '#93c5fd', 'border-color': '#1d4ed8' } },
            { selector: 'node.dimmed', style: { opacity: 0.38 } },
            { selector: 'node.selected-node', style: { 'border-width': 5, 'border-color': '#0f172a', opacity: 1 } },
            { selector: 'node:selected', style: { 'border-width': 5, 'border-color': '#0f172a' } },
            {
              selector: 'edge',
              style: {
                label: '',
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'line-color': '#94a3b8',
                'target-arrow-color': '#64748b',
                'arrow-scale': 1.1,
                width: 2,
                'font-size': 8,
                color: '#475569'
              }
            },
            { selector: 'edge.dimmed', style: { opacity: 0.16 } },
            { selector: 'edge.highlighted', style: { label: 'data(label)', 'line-color': '#0f766e', 'target-arrow-color': '#0f766e', width: 4, opacity: 1 } }
          ],
          layout: { name: 'cose', animate: false, padding: 65, nodeRepulsion: 16000, idealEdgeLength: 170 },
          minZoom: 0.25,
          maxZoom: 3
        });

        cy = instance;
        instance.on('tap', 'node', (event) => {
          selectNode(event.target.id());
        });
        instance.on('tap', (event) => {
          if (event.target === instance) clearSelection();
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
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Concept preview · Fictional Auron Mobility data</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">Knowledge graph</h2>
    <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Inspect sample relationships across departments, projects, engineering problems and solutions. Select a node to open its details; the network is illustrative and runs locally in your browser.</p>
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
        <span class="rounded-full bg-rose-100 px-2 py-1">Problem</span>
        <span class="rounded-full bg-teal-100 px-2 py-1">Solution</span>
        <span class="rounded-full bg-violet-100 px-2 py-1">Decision / lesson</span>
        <span class="rounded-full bg-slate-100 px-2 py-1">Auron Mobility demo relationships</span>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={() => zoomGraph(1 / 1.2)} aria-label="Zoom out">−</button>
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={() => zoomGraph(1.2)} aria-label="Zoom in">+</button>
        <button class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" on:click={fitGraph}>Fit to screen</button>
      </div>
    </div>

    {#if graphError}<div role="alert" class="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">Graph initialization failed: {graphError}</div>{/if}
    <div class={selectedNode ? 'grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]' : ''}>
      <div bind:this={container} class="h-[520px] min-h-[520px] w-full rounded-xl border border-slate-200 bg-slate-50"></div>
      {#if selectedNode}
        <aside aria-label="Selected graph node details" class="max-h-[520px] min-h-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-panel">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">{selectedNode.knowledgeType}</div>
              <h3 class="mt-2 break-words text-lg font-semibold leading-6 text-slate-900">{selectedNode.title}</h3>
              <div class="mt-2 break-all font-mono text-xs text-slate-500">Record ID: {selectedNode.id}</div>
            </div>
            <button class="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" on:click={clearSelection} aria-label="Close knowledge details">Close</button>
          </div>

          <div class="mt-5 space-y-4">
            <section>
              <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Description</h4>
              <p class="mt-1 text-sm leading-5 text-slate-800">{selectedNode.description}</p>
            </section>
            <section>
              <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Detailed explanation</h4>
              <p class="mt-1 text-sm leading-5 text-slate-700">{selectedNode.explanation}</p>
            </section>
            <dl class="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div><dt class="text-xs font-medium text-slate-500">Department</dt><dd class="mt-0.5 break-words text-slate-800">{selectedNode.department}</dd></div>
              <div><dt class="text-xs font-medium text-slate-500">Associated project</dt><dd class="mt-0.5 break-words text-slate-800">{selectedNode.project}</dd></div>
              <div><dt class="text-xs font-medium text-slate-500">Engineering component</dt><dd class="mt-0.5 break-words text-slate-800">{selectedNode.component}</dd></div>
              <div><dt class="text-xs font-medium text-slate-500">Validation status</dt><dd class="mt-0.5 break-words text-slate-800">{selectedNode.validation}</dd></div>
              <div><dt class="text-xs font-medium text-slate-500">Source document or issue</dt><dd class="mt-0.5 break-words text-slate-800">{selectedNode.source}</dd></div>
            </dl>
            <section>
              <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Direct relationships</h4>
              {#if selectedRelations.length}
                <ul class="mt-2 space-y-2">
                  {#each selectedRelations as relation}
                    {@const connectedId = relation.source === selectedNode.id ? relation.target : relation.source}
                    {@const connectedNode = graphData.find((node) => node.id === connectedId)}
                    <li>
                      <button class="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-teal-300 hover:bg-teal-50" on:click={() => selectNode(connectedId)}>
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.1em] text-teal-800">{relation.label.replaceAll('_', ' ')}</span>
                        <span class="mt-1 block text-sm font-medium text-slate-900">{connectedNode?.label ?? connectedId}</span>
                        <span class="mt-0.5 block text-xs text-slate-500">{connectedNode?.type ?? 'Related record'} · Open details</span>
                      </button>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p class="mt-2 text-sm text-slate-500">No linked relationships in the demo data.</p>
              {/if}
            </section>
            <p class="text-xs leading-4 text-slate-500">These details and relationships are part of the fictional Auron Mobility demo dataset.</p>
          </div>
        </aside>
      {/if}
    </div>
    <div class="mt-2 text-xs text-slate-500">Relationships shown are part of the fictional Auron Mobility demonstration dataset.</div>
  </div>
</div>
