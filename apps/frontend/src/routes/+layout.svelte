<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import {
    LayoutDashboard,
    FolderKanban,
    Network,
    Search,
    Bot,
    Users,
    PlugZap
  } from 'lucide-svelte';

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/graph', label: 'Knowledge Graph', icon: Network },
    { href: '/explorer', label: 'Knowledge Explorer', icon: Search },
    { href: '/assistant', label: 'AI Assistant', icon: Bot },
    { href: '/people', label: 'People & Handover', icon: Users },
    { href: '/integrations', label: 'Integrations', icon: PlugZap }
  ];

  $: pathname = $page.url.pathname;
</script>

<div class="flex min-h-screen bg-slate">
  <aside class="w-72 shrink-0 bg-navy text-slate-100 p-6">
    <div class="mb-8">
      <div class="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Auron Mobility</div>
      <h1 class="mt-3 text-2xl font-semibold tracking-tight">Nexus Knowledge</h1>
    </div>

    <nav class="space-y-2">
      {#each navItems as item}
        {@const Icon = item.icon}
        <a
          href={item.href}
          class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${pathname === item.href ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
        >
          <Icon size={18} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div class="text-xs uppercase tracking-[0.2em] text-slate-400">System status</div>
      <div class="mt-3 flex items-center justify-between text-sm">
        <span>AI extraction</span>
        <span class="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-300">demo mode</span>
      </div>
      <div class="mt-2 flex items-center justify-between text-sm">
        <span>Jira connector</span>
        <span class="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-300">mock mode</span>
      </div>
    </div>
  </aside>

  <main class="flex-1 p-6 md:p-8">
    <slot />
  </main>
</div>
