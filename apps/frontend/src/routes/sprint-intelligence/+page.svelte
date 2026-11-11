<script lang="ts">
  import { ClipboardList, Lightbulb, TriangleAlert, CheckCircle2 } from 'lucide-svelte';

  const findings = [
    { kind: 'Problem', icon: TriangleAlert, tone: 'text-rose-700', labelTone: 'text-rose-800', title: 'PCB temperature exceeded its operating threshold', detail: 'Observed after the sensor enclosure redesign during an extended-operation test.' },
    { kind: 'Decision', icon: ClipboardList, tone: 'text-blue-700', labelTone: 'text-blue-800', title: 'Restore minimum ventilation clearance', detail: 'Mechanical and Electrical agreed to treat PCB keepout and airflow as a controlled interface.' },
    { kind: 'Solution', icon: CheckCircle2, tone: 'text-emerald-700', labelTone: 'text-emerald-800', title: 'Revise PCB placement and enclosure vent geometry', detail: 'Thermal verification passed under the documented demonstration test profile.' },
    { kind: 'Lesson', icon: Lightbulb, tone: 'text-amber-700', labelTone: 'text-amber-800', title: 'Validate enclosure changes with a thermal soak', detail: 'Include extended-operation conditions and worst-case clearance in future design reviews.' }
  ];
</script>

<svelte:head>
  <title>Nexus Knowledge | Sprint Intelligence Preview</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
  <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div><p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Concept preview · Not connected to a sprint system</p><h1 class="mt-2 text-3xl font-semibold text-slate-900">Sprint intelligence</h1><p class="mt-2 text-sm leading-6 text-slate-600">A sample retrospective showing how project activity could be organized into reusable engineering knowledge.</p></div>
    <span class="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900">Illustrative retrospective</span>
  </header>

  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
      <div><h2 class="text-lg font-semibold text-slate-900">Project Alpha · Sensor Housing</h2><p class="mt-1 text-sm text-slate-500">Sample sprint retrospective · Fictional Auron Mobility data</p></div>
      <div class="text-sm text-slate-500">Sprint 08 · 10–21 Aug 2026</div>
    </div>
    <div class="mt-4 grid gap-3 md:grid-cols-2">
      {#each findings as finding}
        {@const Icon = finding.icon}
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center gap-2"><Icon size={17} class={finding.tone} /><span class={`text-xs font-semibold uppercase tracking-wide ${finding.labelTone}`}>{finding.kind}</span></div>
          <h3 class="mt-2 font-semibold text-slate-900">{finding.title}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">{finding.detail}</p>
        </article>
      {/each}
    </div>
    <p class="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">This is a fixed concept preview. Sprint extraction, Jira synchronization and AI summarization are not implemented.</p>
  </section>
</div>
