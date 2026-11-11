<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowUpRight, Boxes, CalendarDays, Code2, Mail, MessageSquare, Tickets, FolderOpen } from 'lucide-svelte';

  const integrations = [
    { name: 'Jira', icon: Tickets, area: 'Issues & sprint history', details: 'Discover decisions, problem reports and resolution evidence from engineering work items.' },
    { name: 'Microsoft Teams', icon: MessageSquare, area: 'Engineering conversations', details: 'Capture searchable design discussions and handover context from team channels.' },
    { name: 'SharePoint', icon: FolderOpen, area: 'Documents & procedures', details: 'Connect controlled design documents, test reports and manufacturing procedures.' },
    { name: 'Outlook', icon: Mail, area: 'Project communications', details: 'Find important project decisions and knowledge shared across email threads.' },
    { name: 'GitHub', icon: Code2, area: 'Code & change history', details: 'Relate source changes, pull request discussions and technical decisions.' },
    { name: 'PLM systems', icon: Boxes, area: 'Product lifecycle records', details: 'Connect product structures, engineering changes and formal verification evidence.' }
  ];
</script>

<svelte:head>
  <title>Nexus Knowledge | Integration Previews</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Concept preview · No connectors are active</p>
    <h1 class="mt-2 text-3xl font-semibold text-slate-900">Meet engineering knowledge where it lives</h1>
    <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">These planned integration concepts show how Nexus could bring fragmented project knowledge together. This MVP runs entirely on fictional local data.</p>
  </header>

  <div class="grid gap-4 md:grid-cols-2">
    {#each integrations as integration}
      {@const Icon = integration.icon}
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3"><span class="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Icon size={20} /></span><div><h2 class="font-semibold text-slate-900">{integration.name}</h2><p class="mt-0.5 text-xs text-slate-500">{integration.area}</p></div></div>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Planned</span>
        </div>
        <p class="mt-4 text-sm leading-6 text-slate-600">{integration.details}</p>
        <div class="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500"><CalendarDays size={14} /> Concept only · No live connection</div>
      </article>
    {/each}
  </div>
  <a href={`${base}/discovery/`} class="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950">Try browser-side knowledge discovery <ArrowUpRight size={16} /></a>
</div>
