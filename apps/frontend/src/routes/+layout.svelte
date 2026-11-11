<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import {
    LayoutDashboard,
    Network,
    Search,
    Users,
    PlugZap,
    Activity
  } from 'lucide-svelte';
  import { base } from '$app/paths';

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/discovery', label: 'Knowledge Discovery', icon: Search },
    { href: '/graph', label: 'Knowledge Graph', icon: Network },
    { href: '/sprint-intelligence', label: 'Sprint Intelligence', icon: Activity },
    { href: '/people', label: 'People & Handover', icon: Users },
    { href: '/integrations', label: 'Integrations', icon: PlugZap }
  ];

  $: pathname = $page.url.pathname;
  const isActive = (href: string) => href === '/'
    ? pathname === `${base}/` || pathname.replace(/\/$/, '') === base
    : pathname.replace(/\/$/, '') === `${base}${href}`;
  const routeHref = (href: string) => `${base}${href === '/' ? '/' : `${href}/`}`;
</script>

<div class="flex min-h-screen bg-slate">
  <aside class="w-72 shrink-0 bg-sidebar text-sidebar-text p-6">
    <div class="mb-8">
      <div class="text-xs uppercase tracking-[0.22em] text-sidebar-muted">Auron Mobility</div>
      <h1 class="mt-3 text-2xl font-semibold tracking-tight">Nexus Knowledge</h1>
    </div>

    <nav class="space-y-2">
      {#each navItems as item}
        {@const Icon = item.icon}
        <a
          href={routeHref(item.href)}
          aria-current={isActive(item.href) ? 'page' : undefined}
          class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive(item.href) ? 'bg-sidebar-active text-white ring-1 ring-white/15' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'}`}
        >
          <Icon size={18} class={isActive(item.href) ? 'text-white' : 'text-sidebar-muted'} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4">
      <div class="text-xs uppercase tracking-[0.2em] text-sidebar-label">MVP prototype</div>
      <p class="mt-3 text-xs leading-5 text-sidebar-text">Browser-only knowledge search over fictional Auron Mobility data.</p>
      <div class="mt-3 inline-flex rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-200">No backend required</div>
    </div>
  </aside>

  <main class="flex-1 p-6 md:p-8">
    <slot />
  </main>
</div>
