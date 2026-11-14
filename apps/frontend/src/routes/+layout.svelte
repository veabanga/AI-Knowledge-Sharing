<script lang="ts">
  import '../app.css';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import {
    Activity,
    Compass,
    LayoutDashboard,
    Menu,
    Network,
    PlugZap,
    Search,
    Users,
    X
  } from 'lucide-svelte';
  import { base } from '$app/paths';
  import TourManager from '$lib/components/TourManager.svelte';
  import { loadKnowledgeStore, knowledgeStore } from '$lib/knowledge-store';
  import { finishTour } from '$lib/tour';

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/discovery', label: 'Knowledge Discovery', icon: Search },
    { href: '/contribute', label: 'Contribute Knowledge', icon: Compass },
    { href: '/graph', label: 'Knowledge Graph', icon: Network },
    { href: '/sprint-intelligence', label: 'Sprint Intelligence', icon: Activity },
    { href: '/people', label: 'People & Handover', icon: Users },
    { href: '/integrations', label: 'Integrations', icon: PlugZap }
  ];

  let menuOpen = false;
  let storeError = '';
  let drawerCloseButton: HTMLButtonElement;

  $: pathname = $page.url.pathname;
  $: normalizedPath = normalizePath(pathname);
  $: activeNavHref = navItems.find(({ href }) =>
    href === '/'
      ? normalizedPath === '/' || normalizedPath === ''
      : normalizedPath === href || normalizedPath.startsWith(`${href}/`)
  )?.href
    ?? (['/assistant', '/explorer', '/projects'].includes(normalizedPath) ? '/discovery' : undefined);
  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }
  $: if (menuOpen && drawerCloseButton) void tick().then(() => drawerCloseButton.focus());

  function normalizePath(pathname: string) {
    const appPath = base && (pathname === base || pathname.startsWith(`${base}/`))
      ? pathname.slice(base.length) || '/'
      : pathname;
    return appPath.length > 1 ? appPath.replace(/\/+$/, '') : appPath;
  }

  function routeHref(href: string) {
    return `${base}${href === '/' ? '/' : `${href}/`}`;
  }

  function startProductTour() {
    menuOpen = false;
    finishTour();
    window.dispatchEvent(new CustomEvent('nexus-start-tour'));
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && menuOpen) menuOpen = false;
  }

  afterNavigate(() => {
    menuOpen = false;
  });

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    try {
      loadKnowledgeStore();
    } catch (error) {
      storeError = error instanceof Error ? error.message : 'Browser contributions could not be loaded.';
    }
    const onStorage = (event: StorageEvent) => {
      try {
        knowledgeStore.handleStorage(event);
        storeError = '';
      } catch (error) {
        storeError = error instanceof Error ? error.message : 'Browser contributions could not be refreshed.';
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('storage', onStorage);
      document.body.style.overflow = '';
    };
  });
</script>

<div class="flex min-h-screen min-w-0 overflow-x-clip bg-slate">
  <aside class="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto bg-sidebar p-6 text-sidebar-text lg:block">
    <div class="mb-8">
      <div class="text-xs uppercase tracking-[0.22em] text-sidebar-muted">Auron Mobility</div>
      <h1 class="mt-3 text-2xl font-semibold tracking-tight">Nexus Knowledge</h1>
    </div>
    <nav aria-label="Main navigation" class="space-y-2">
      {#each navItems as item}
        {@const Icon = item.icon}
        <a
          href={routeHref(item.href)}
          aria-current={activeNavHref === item.href ? 'page' : undefined}
          class={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${activeNavHref === item.href ? 'bg-sidebar-active text-white ring-1 ring-white/15' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'}`}
        >
          <Icon size={18} class={activeNavHref === item.href ? 'text-white' : 'text-sidebar-muted'} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>
    <button class="mt-5 flex min-h-11 w-full items-center gap-3 rounded-xl border border-white/15 px-3 py-2.5 text-left text-sm text-sidebar-text hover:bg-sidebar-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300" on:click={startProductTour}>
      <Compass size={18} class="text-sidebar-muted" />Take a tour
    </button>
    <div class="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4">
      <div class="text-xs uppercase tracking-[0.2em] text-sidebar-label">MVP prototype</div>
      <p class="mt-3 text-xs leading-5 text-sidebar-text">Browser-only knowledge search and manual contribution over fictional Auron Mobility data.</p>
      <div class="mt-3 inline-flex rounded-full bg-teal-500/15 px-2.5 py-1 text-xs font-medium text-teal-200">No backend required</div>
    </div>
  </aside>

  <header class="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
    <a href={routeHref('/')} class="min-w-0">
      <span class="block text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-800">Auron Mobility</span>
      <span class="block truncate text-base font-semibold leading-5 text-slate-900">Nexus Knowledge</span>
    </a>
    <button class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700" aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" on:click={() => (menuOpen = true)}>
      <Menu size={22} />
    </button>
  </header>

  {#if menuOpen}
    <div class="fixed inset-0 z-50 bg-slate-950/50 lg:hidden" role="presentation" on:click={(event) => { if (event.target === event.currentTarget) menuOpen = false; }}>
      <aside id="mobile-navigation" class="flex h-full w-[min(21rem,88vw)] flex-col overflow-y-auto bg-sidebar p-5 text-sidebar-text shadow-2xl" aria-label="Mobile navigation">
        <div class="flex items-start justify-between gap-3 pb-6">
          <div><div class="text-xs uppercase tracking-[0.2em] text-sidebar-muted">Auron Mobility</div><div class="mt-2 text-xl font-semibold text-white">Nexus Knowledge</div></div>
          <button bind:this={drawerCloseButton} class="flex h-11 w-11 items-center justify-center rounded-lg text-sidebar-text hover:bg-sidebar-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300" aria-label="Close navigation menu" on:click={() => (menuOpen = false)}><X size={20} /></button>
        </div>
        <nav aria-label="Main navigation" class="space-y-1.5">
          {#each navItems as item}
            {@const Icon = item.icon}
            <a href={routeHref(item.href)} aria-current={activeNavHref === item.href ? 'page' : undefined} class={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300 ${activeNavHref === item.href ? 'bg-sidebar-active text-white ring-1 ring-white/15' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'}`}>
              <Icon size={19} class={activeNavHref === item.href ? 'text-white' : 'text-sidebar-muted'} /><span>{item.label}</span>
            </a>
          {/each}
        </nav>
        <button class="mt-4 flex min-h-12 items-center gap-3 rounded-xl border border-white/15 px-3 py-3 text-left text-sm text-sidebar-text hover:bg-sidebar-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300" on:click={startProductTour}><Compass size={19} class="text-sidebar-muted" />Take a tour</button>
        <div class="mt-auto pt-6 text-xs leading-5 text-sidebar-muted">Browser-only prototype · No backend required</div>
      </aside>
    </div>
  {/if}

  <main class="min-w-0 w-full px-4 pb-6 pt-[4.5rem] sm:px-5 md:px-8 md:pb-8 lg:pt-8">
    {#if storeError}<div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900" role="alert">{storeError}</div>{/if}
    <slot />
  </main>
</div>
<TourManager />
