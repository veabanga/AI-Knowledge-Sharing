<script lang="ts">
  import { people } from '$lib/demo';
</script>

<svelte:head>
  <title>Nexus Knowledge | People & Handover</title>
</svelte:head>

<div class="space-y-6">
  <header>
    <p class="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Team intelligence</p>
    <h2 class="mt-2 text-3xl font-semibold text-slate-900">People & handover</h2>
  </header>

  <div class="grid gap-5 xl:grid-cols-2">
    {#each people as person}
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-xl font-semibold text-slate-900">{person.name}</div>
            <div class="mt-1 text-sm text-slate-600">{person.role} · {person.department}</div>
          </div>
          <span class={`rounded-full px-2 py-1 text-xs font-medium ${person.risk === 'low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {person.risk} risk
          </span>
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

        <div class="mt-5 text-sm text-slate-600">
          Knowledge ownership includes thermal housing design, firmware calibration tuning, and production test specification. Suggested successor: {person.name === 'Alex Morgan' ? 'Michael Weber' : 'Alex Morgan'}.
        </div>
      </div>
    {/each}
  </div>
</div>
