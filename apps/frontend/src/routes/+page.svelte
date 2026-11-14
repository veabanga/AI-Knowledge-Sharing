<script lang="ts">
  import { base } from '$app/paths';
  import { ArrowRight, BookOpenCheck, Network, Search, ShieldCheck, Sparkles } from 'lucide-svelte';
  import { knowledgeDepartments, knowledgeProjects, knowledgeRecords, suggestedSearches } from '$lib/knowledge';
</script>

<svelte:head>
  <title>Nexus Knowledge | Engineering knowledge, reused</title>
  <meta name="description" content="Find proven engineering knowledge across projects with the Nexus Knowledge browser demo." />
</svelte:head>

<div class="mx-auto max-w-[1400px] space-y-8">
  <section data-tour="overview-hero" class="relative overflow-hidden rounded-3xl bg-navy px-5 py-7 text-white shadow-panel sm:px-6 sm:py-9 md:px-10 md:py-12">
    <div class="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-teal-300/10"></div>
    <div class="absolute -right-4 -top-8 h-48 w-48 rounded-full border border-teal-300/15"></div>
    <div class="relative max-w-3xl">
      <div class="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-xs font-medium text-teal-200"><Sparkles size={14} /> Auron Mobility engineering knowledge demo</div>
      <h1 class="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">Your engineering organisation has solved this problem before.<br /><span class="text-teal-300">Find out how.</span></h1>
      <p class="mt-5 max-w-2xl text-base leading-7 text-slate-300">Nexus helps engineering teams find previous problems, root causes, validated solutions and lessons across projects—so they can build on what the organisation already knows.</p>
      <a href={`${base}/discovery/`} class="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-semibold text-navy transition hover:bg-teal-300">
        Explore the live demo <ArrowRight size={17} />
      </a>
      <p class="mt-3 text-xs text-slate-400">No login, backend, or API key required. Searches run locally in your browser.</p>
    </div>
  </section>

  <section class="grid gap-4 sm:grid-cols-3" aria-label="Demo dataset overview">
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div class="flex items-center justify-between"><span class="text-sm text-slate-500">Curated knowledge records</span><BookOpenCheck size={19} class="text-teal-700" /></div>
      <div class="mt-3 text-3xl font-semibold text-slate-900">{knowledgeRecords.length}</div>
      <div class="mt-1 text-xs text-slate-500">Problems, decisions, solutions and lessons</div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div class="flex items-center justify-between"><span class="text-sm text-slate-500">Engineering projects</span><Network size={19} class="text-blue-700" /></div>
      <div class="mt-3 text-3xl font-semibold text-slate-900">{knowledgeProjects.length}</div>
      <div class="mt-1 text-xs text-slate-500">Connected through reusable engineering evidence</div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div class="flex items-center justify-between"><span class="text-sm text-slate-500">Departments represented</span><ShieldCheck size={19} class="text-violet-700" /></div>
      <div class="mt-3 text-3xl font-semibold text-slate-900">{knowledgeDepartments.length}</div>
      <div class="mt-1 text-xs text-slate-500">Mechanical, Electrical, Software and Manufacturing</div>
    </div>
  </section>

  <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel md:p-7">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">The engineering challenge</p>
      <h2 class="mt-3 text-2xl font-semibold text-slate-900">Knowledge is scattered. Repeated investigation costs time.</h2>
      <p class="mt-3 text-sm leading-6 text-slate-600">A thermal issue in a new sensor housing may have already been investigated by an electrical team, resolved in another project, and validated in a production test. Nexus brings that evidence into one searchable experience.</p>
      <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800"><Search size={16} class="text-teal-700" /> Start with a real engineering question</div>
        <p class="mt-3 text-sm italic leading-6 text-slate-700">“{suggestedSearches[0]}”</p>
        <a href={`${base}/discovery/`} class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-950">Find related knowledge <ArrowRight size={15} /></a>
      </div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel md:p-7">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Explore the concept</p>
      <div class="mt-4 space-y-3">
        <a href={`${base}/discovery/`} class="group flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/60 p-4 hover:border-teal-300">
          <Search size={18} class="mt-0.5 shrink-0 text-teal-800" />
          <span><span class="block font-semibold text-slate-900">Knowledge Discovery</span><span class="mt-1 block text-sm leading-5 text-slate-600">Search and reuse cross-project solutions. Fully interactive prototype.</span></span>
          <ArrowRight size={16} class="ml-auto mt-0.5 shrink-0 text-teal-800" />
        </a>
        <a href={`${base}/graph/`} class="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:bg-slate-50">
          <Network size={18} class="mt-0.5 shrink-0 text-blue-700" />
          <span><span class="block font-semibold text-slate-900">Knowledge Graph</span><span class="mt-1 block text-sm leading-5 text-slate-600">Inspect sample connections across teams, projects and decisions.</span></span>
          <ArrowRight size={16} class="ml-auto mt-0.5 shrink-0 text-slate-500" />
        </a>
      </div>
      <p class="mt-4 text-xs leading-5 text-slate-500">Other modules are clearly marked concept previews. All Auron Mobility people, records and identifiers are fictional.</p>
    </div>
  </section>
</div>
