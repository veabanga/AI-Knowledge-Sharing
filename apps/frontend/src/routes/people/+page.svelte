<script lang="ts">
  import { people } from '$lib/demo';
</script>

<svelte:head>
  <title>Nexus Knowledge | People & Handover</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Concept preview · Fictional Auron Mobility profiles</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">People & handover</h2>
    <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A sample expertise profile and project handover view. Profiles are fictional and do not represent connected employee data.</p>
  </header>

  <div class="grid gap-5 xl:grid-cols-2">
    {#each people as person}
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-xl font-semibold text-slate-900">{person.name}</div>
            <div class="mt-1 text-sm text-slate-600">{person.role} · {person.department}</div>
          </div>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Sample profile</span>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <div class="rounded-xl bg-slate-50 p-3">
            <div class="text-xs uppercase tracking-[0.16em] text-slate-500">Experience</div>
            <div class="mt-2 text-sm text-slate-800">{person.experience}</div>
          </div>
          <div class="rounded-xl bg-slate-50 p-3">
            <div class="text-xs uppercase tracking-[0.16em] text-slate-500">Projects</div>
            <div class="mt-2 text-sm text-slate-800">{person.projects.join(', ')}</div>
          </div>
        </div>

        <div class="mt-5 rounded-xl border border-teal-100 bg-teal-50/60 p-4">
          <div class="text-xs font-semibold uppercase tracking-wide text-teal-900">Sample handover note</div>
          <p class="mt-2 text-sm leading-6 text-slate-700">{person.name} has project context and expertise documented for a fictional Auron Mobility handover. Review associated design decisions, validation sources and open questions with the receiving engineer.</p>
        </div>
        <div class="mt-4 text-xs text-slate-500">Experience and project associations are illustrative demo content—not connected workforce intelligence.</div>
      </div>
    {/each}
  </div>
</div>
