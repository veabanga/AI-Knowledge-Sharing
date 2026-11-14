<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate, goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { Compass, X } from 'lucide-svelte';
  import { finishTour, startTour, tourAction, tourState, tourTipVisible } from '$lib/tour';

  const routeForStep: Record<number, string> = {
    1: '/',
    2: '/discovery/',
    3: '/discovery/',
    4: '/discovery/',
    5: '/discovery/',
    6: '/graph/',
    7: '/contribute/',
    8: '/discovery/',
    9: '/'
  };
  const targets: Record<number, string> = {
    1: '[data-tour="overview-hero"]',
    2: '[data-tour="discovery-search"]',
    3: '[data-tour="discovery-search"]',
    4: '[data-tour="top-search-result"]',
    5: '[data-tour="knowledge-detail-panel"]',
    6: '[data-tour="knowledge-graph"]',
    7: '[data-tour="contribution-sample"]',
    8: '[data-tour="top-search-result"]',
    9: '[data-tour="overview-hero"]'
  };
  const explanations: Record<number, { title: string; text: string }> = {
    1: {
      title: 'Engineering knowledge, connected',
      text: 'Nexus Knowledge helps engineering teams discover previously solved problems and reuse knowledge across projects and departments.'
    },
    2: {
      title: 'Knowledge Discovery',
      text: 'Engineers can search previous problems and solutions across the organisation using symptoms, root causes, components or lessons.'
    },
    3: {
      title: 'Search for an engineering problem',
      text: 'We’ll run a natural-language-style example through the browser-side prototype retrieval engine. Results are ranked from the curated records—no live AI service is involved.'
    },
    4: {
      title: 'A relevant cross-project match',
      text: 'This is the highest-ranked result. Its match explanation shows which fields matched; inspect its department and originating project before reusing the evidence.'
    },
    5: {
      title: 'Inspect the evidence',
      text: 'Review the original problem, root cause, previously validated solution, lessons learned, related issues and illustrative source references.'
    },
    6: {
      title: 'Knowledge Graph',
      text: 'The sample graph connects engineering records to their projects and departments, and links related knowledge across team boundaries.'
    },
    7: {
      title: 'Contribute knowledge manually',
      text: 'Engineering knowledge can be contributed manually today. In future versions, Nexus may extract knowledge from documents and connected enterprise systems. Submit a record here to continue the tour; nothing is added without your confirmation.'
    },
    8: {
      title: 'Your contribution is searchable',
      text: 'The submitted record is now part of this browser’s knowledge collection. It is ranked by the same search engine and can be opened like any other record.'
    },
    9: {
      title: 'The longer-term vision',
      text: 'Today, Nexus demonstrates knowledge discovery and manual knowledge capture. The longer-term vision is to automatically preserve and connect engineering knowledge from existing enterprise workflows.'
    }
  };

  let focusedStep = 0;
  let welcomeOpen = true;
  let safeAreaProbe: HTMLDivElement;

  $: pathname = $page.url.pathname;
  $: activeTourStep = $tourState.active ? $tourState.step : 0;
  $: currentExplanation = explanations[activeTourStep];
  $: if (activeTourStep > 0 && activeTourStep !== focusedStep) {
    focusedStep = activeTourStep;
    void tick().then(() => {
      focusTarget(activeTourStep);
    });
  } else if (activeTourStep === 0 && focusedStep !== 0) {
    focusedStep = 0;
    clearTargets();
  }

  function clearTargets() {
    document.querySelectorAll('.tour-target').forEach((element) => element.classList.remove('tour-target'));
  }

  function focusTarget(step: number) {
    clearTargets();
    const target = document.querySelector<HTMLElement>(targets[step]);
    if (!target) return;
    target.scrollIntoView({ behavior: step === 7 ? 'instant' : 'smooth', block: 'center' });
    target.classList.add('tour-target');
  }

  function trackTourContent(node: HTMLDivElement) {
    const updateFade = () => {
      const maxScroll = node.scrollHeight - node.clientHeight;
      node.classList.toggle('has-more-below', maxScroll > 1 && node.scrollTop < maxScroll - 1);
    };
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(updateFade);
    const mutationObserver = typeof MutationObserver === 'undefined'
      ? undefined
      : new MutationObserver(() => {
          observeChildren();
          updateFade();
        });
    const observeChildren = () => {
      resizeObserver?.disconnect();
      resizeObserver?.observe(node);
      Array.from(node.children).forEach((child) => resizeObserver?.observe(child));
    };

    node.addEventListener('scroll', updateFade, { passive: true });
    observeChildren();
    mutationObserver?.observe(node, { childList: true, characterData: true, subtree: true });
    updateFade();

    return {
      destroy() {
        node.removeEventListener('scroll', updateFade);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        node.classList.remove('has-more-below');
      }
    };
  }

  function positionTour(node: HTMLElement, initialStep: number) {
    let step = initialStep;
    let target: HTMLElement | null = null;
    let frame = 0;
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(schedule);
    const mutationObserver = typeof MutationObserver === 'undefined'
      ? undefined
      : new MutationObserver(schedule);

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    }

    function measure() {
      if (!node.isConnected) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const safeArea = safeAreaProbe ? getComputedStyle(safeAreaProbe) : undefined;
      const topInset = Math.max(12, parseFloat(safeArea?.paddingTop ?? '0') || 0);
      const rightInset = Math.max(12, parseFloat(safeArea?.paddingRight ?? '0') || 0);
      const bottomInset = Math.max(12, parseFloat(safeArea?.paddingBottom ?? '0') || 0);
      const leftInset = Math.max(12, parseFloat(safeArea?.paddingLeft ?? '0') || 0);
      const topEdge = viewportTop + topInset;
      const bottomEdge = viewportTop + viewportHeight - bottomInset;
      const leftEdge = viewportLeft + leftInset;
      const rightEdge = viewportLeft + viewportWidth - rightInset;
      const gap = 12;
      const width = Math.min(416, rightEdge - leftEdge);
      const isNarrow = viewportWidth < 768;

      let left = isNarrow
        ? leftEdge + (rightEdge - leftEdge - width) / 2
        : rightEdge - width;
      const targetRect = target?.isConnected ? target.getBoundingClientRect() : null;

      if (targetRect && !isNarrow) {
        left = Math.min(rightEdge - width, Math.max(leftEdge, targetRect.left + targetRect.width / 2 - width / 2));
      }

      node.style.setProperty('--tour-left', `${Math.round(left)}px`);
      node.style.setProperty('--tour-width', `${Math.round(width)}px`);

      const header = node.querySelector<HTMLElement>('.tour-header');
      const content = node.querySelector<HTMLElement>('.tour-content-region');
      const footer = node.querySelector<HTMLElement>('.tour-footer');
      if (!header || !content || !footer) return;
      resizeObserver?.observe(header);
      resizeObserver?.observe(content);
      resizeObserver?.observe(footer);

      const cardStyle = getComputedStyle(node);
      const verticalChrome = parseFloat(cardStyle.paddingTop) + parseFloat(cardStyle.paddingBottom)
        + parseFloat(cardStyle.borderTopWidth) + parseFloat(cardStyle.borderBottomWidth);
      const contentStyle = getComputedStyle(content);
      const footerStyle = getComputedStyle(footer);
      const fontSize = parseFloat(contentStyle.fontSize) || 14;
      const lineHeight = parseFloat(contentStyle.lineHeight) || fontSize * 1.5;
      const contentPadding = parseFloat(contentStyle.paddingTop) + parseFloat(contentStyle.paddingBottom);
      const footerMarginTop = parseFloat(footerStyle.marginTop) || 0;
      const naturalHeight = header.offsetHeight + content.scrollHeight + footer.offsetHeight + footerMarginTop + verticalChrome;
      const minContentHeight = lineHeight * 3 + contentPadding;
      const minUsableHeight = header.offsetHeight + footer.offsetHeight + footerMarginTop + minContentHeight + verticalChrome;
      let top = bottomEdge - naturalHeight;
      let availableHeight = bottomEdge - topEdge;

      if (targetRect) {
        const above = Math.max(0, targetRect.top - gap - topEdge);
        const below = Math.max(0, bottomEdge - targetRect.bottom - gap);
        const fitsAbove = above >= naturalHeight;
        const fitsBelow = below >= naturalHeight;
        const placeAbove = fitsAbove || (!fitsBelow && above >= below);
        const sideSpace = placeAbove ? above : below;

        if (fitsAbove || fitsBelow) {
          availableHeight = naturalHeight;
          top = placeAbove ? targetRect.top - gap - naturalHeight : targetRect.bottom + gap;
        } else if (sideSpace >= minUsableHeight) {
          availableHeight = sideSpace;
          top = placeAbove ? targetRect.top - gap - sideSpace : targetRect.bottom + gap;
        } else {
          availableHeight = Math.min(bottomEdge - topEdge, Math.max(minUsableHeight, sideSpace));
          top = placeAbove ? topEdge : bottomEdge - availableHeight;
        }
      }

      availableHeight = Math.max(1, Math.min(availableHeight, bottomEdge - topEdge));
      top = Math.min(bottomEdge - availableHeight, Math.max(topEdge, top));
      node.style.setProperty('--tour-top', `${Math.round(top)}px`);
      node.style.setProperty('--tour-max-height', `${Math.round(availableHeight)}px`);
    }

    function updateTarget() {
      const nextTarget = step > 0 ? document.querySelector<HTMLElement>(targets[step]) : null;
      if (nextTarget !== target) {
        if (target) resizeObserver?.unobserve(target);
        target = nextTarget;
        if (target) resizeObserver?.observe(target);
      }
      schedule();
    }

    function handleViewportChange() {
      schedule();
    }

    resizeObserver?.observe(node);
    mutationObserver?.observe(node, { childList: true, characterData: true, subtree: true });
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);
    updateTarget();

    return {
      update(nextStep: number) {
        step = nextStep;
        void tick().then(updateTarget);
      },
      destroy() {
        if (frame) cancelAnimationFrame(frame);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange, true);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
        node.style.removeProperty('--tour-left');
        node.style.removeProperty('--tour-top');
        node.style.removeProperty('--tour-width');
        node.style.removeProperty('--tour-max-height');
      }
    };
  }

  function begin() {
    welcomeOpen = false;
    startTour();
    if (pathname !== `${base}/` && pathname.replace(/\/$/, '') !== base) void goto(`${base}/`);
  }

  function dismissWelcome() {
    welcomeOpen = false;
  }

  function finish() {
    finishTour();
  }

  async function moveToStep(step: number) {
    const destination = `${base}${routeForStep[step]}`;
    if (pathname !== destination && pathname.replace(/\/$/, '') !== destination.replace(/\/$/, '')) {
      await goto(destination);
    }
    tourState.update((state) => ({ ...state, active: true, step }));
  }

  async function next() {
    const step = activeTourStep;
    if (step === 3) tourAction.set('run-example-search');
    if (step === 4) tourAction.set('open-top-result');
    if (step === 5 && window.matchMedia('(max-width: 1023px)').matches) tourAction.set('close-detail');
    if (step === 7) return;
    if (step >= 9) {
      finish();
      return;
    }
    await moveToStep(step + 1);
  }

  async function back() {
    if (activeTourStep <= 1) return;
    const step = activeTourStep;
    if (step === 5) tourAction.set('close-detail');
    await moveToStep(step - 1);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (welcomeOpen) dismissWelcome();
    else if ($tourState.active) finish();
  }

  function takeTourFromMenu() {
    begin();
  }

  afterNavigate(() => {
    if (activeTourStep) void tick().then(() => focusTarget(activeTourStep));
  });

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    const handleStartTour = () => takeTourFromMenu();
    window.addEventListener('nexus-start-tour', handleStartTour);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('nexus-start-tour', handleStartTour);
      clearTargets();
    };
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#081b2d" />
</svelte:head>

<div bind:this={safeAreaProbe} class="tour-safe-area-probe" aria-hidden="true"></div>

{#if welcomeOpen}
  <div class="welcome-overlay fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto overscroll-contain p-[max(0.75rem,env(safe-area-inset-top))] sm:items-center sm:p-4" role="presentation" on:click={(event) => { if (event.target === event.currentTarget) dismissWelcome(); }}>
    <dialog open class="welcome-card relative mx-0 my-auto flex max-h-[calc(100dvh_-_max(1.5rem,env(safe-area-inset-top)))] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-2xl p-5 shadow-2xl sm:max-h-[calc(100dvh_-_2rem)] sm:p-8" aria-modal="true" aria-labelledby="welcome-title">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3"><span class="rounded-xl bg-teal-300/15 p-2.5 text-teal-200"><Compass size={21} /></span><div><p class="text-xs font-semibold uppercase tracking-wide text-teal-200">Auron Mobility demo</p><h2 id="welcome-title" class="mt-1 text-xl font-semibold text-white">Welcome to Nexus Knowledge</h2></div></div>
        <button class="welcome-close rounded-lg p-2" aria-label="Close welcome dialog" on:click={dismissWelcome}><X size={18} /></button>
      </div>
      <p class="mt-5 text-sm leading-6 text-slate-200">Discover how engineering teams can reuse knowledge, find previously solved problems and preserve valuable experience across projects.</p>
      <p class="mt-4 font-medium text-white">Would you like a quick guided tour?</p>
      <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button class="welcome-primary min-h-12 rounded-xl px-4 py-3 text-sm font-bold" on:click={begin}>Yes, take a tour</button>
        <button class="welcome-secondary min-h-12 rounded-xl px-4 py-3 text-sm font-semibold" on:click={dismissWelcome}>No thanks</button>
      </div>
    </dialog>
  </div>
{/if}

{#if activeTourStep > 0 && currentExplanation}
  {#if $tourTipVisible}
    <section
      class="tour-card fixed z-[60]"
      use:positionTour={activeTourStep}
      aria-label="Guided product tour"
    >
      {#key activeTourStep}
        <div class="tour-layout">
          <header class="tour-header">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-wide text-teal-200">Guided product tour · Step {activeTourStep} of 9</div>
                <h2 class="mt-2 text-lg font-semibold text-white">{currentExplanation.title}</h2>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <button
                  class="tour-visibility-control rounded-md px-2 py-1 text-xs font-medium"
                  aria-label="Hide tour tip"
                  aria-expanded="true"
                  on:click={() => tourTipVisible.set(false)}
                >Hide tip</button>
                <button class="tour-icon rounded-md p-1.5" aria-label="Skip tour" on:click={finish}><X size={17} /></button>
              </div>
            </div>
          </header>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <div
            class="tour-content-region"
            use:trackTourContent
            tabindex="0"
            role="region"
            aria-label="Tour step details"
          >
            <p class="text-sm leading-6 text-slate-200">{currentExplanation.text}</p>
          {#if activeTourStep === 7}
            <p class="mt-3 rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-xs leading-5 text-amber-100">Complete and submit the contribution form to continue. The tour will then show you the new searchable record.</p>
          {/if}
          </div>
          <footer class="tour-footer">
            <button class="tour-secondary min-h-10 rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40" disabled={activeTourStep === 1} on:click={back}>Back</button>
            <div class="ml-auto flex gap-2">
              {#if activeTourStep !== 7}<button class="tour-secondary min-h-10 rounded-lg px-3 py-2 text-sm font-medium" on:click={finish}>Skip tour</button>{/if}
              {#if activeTourStep === 9}<button class="tour-primary min-h-10 rounded-lg px-4 py-2 text-sm font-bold" on:click={finish}>Finish tour</button>
              {:else if activeTourStep !== 7}<button class="tour-primary min-h-10 rounded-lg px-4 py-2 text-sm font-bold" on:click={next}>{activeTourStep === 3 ? 'Run example search' : activeTourStep === 4 ? 'Inspect this result' : 'Next'}</button>{/if}
            </div>
          </footer>
        </div>
      {/key}
    </section>
  {:else}
    <button
      class:tour-show-control-centered={activeTourStep === 7}
      class="tour-show-control fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 z-[60] min-h-11 rounded-full px-4 py-2 text-sm font-semibold shadow-xl"
      aria-label={`Show tour tip, step ${activeTourStep} of 9`}
      aria-expanded="false"
      on:click={() => tourTipVisible.set(true)}
    >Show tip · Step {activeTourStep} of 9</button>
  {/if}
{/if}

<style>
  .welcome-overlay {
    background: rgba(2, 8, 23, 0.72);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .welcome-card {
    color: #f8fafc;
    background: rgba(8, 27, 45, 0.97);
    border: 1px solid rgba(255, 255, 255, 0.16);
  }

  .welcome-primary {
    appearance: none;
    color: #081b2d;
    background: #32c7b8;
    border: 1px solid #6ee7d8;
    transition: background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
  }

  .welcome-primary:hover {
    background: #5ee0d1;
  }

  .welcome-primary:active {
    background: #20b6a8;
    transform: translateY(1px);
  }

  .welcome-secondary {
    appearance: none;
    color: #f8fafc;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.32);
    transition: background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
  }

  .welcome-secondary:hover {
    background: rgba(255, 255, 255, 0.14);
  }

  .welcome-secondary:active {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(1px);
  }

  .welcome-primary:focus-visible,
  .welcome-secondary:focus-visible,
  .welcome-close:focus-visible {
    outline: 3px solid #7dd3fc;
    outline-offset: 3px;
  }

  .welcome-close {
    color: #cbd5e1;
  }

  .welcome-close:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .tour-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
    width: var(--tour-width, min(26rem, calc(100vw - 1.5rem)));
    max-height: var(--tour-max-height, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 1.5rem));
    top: var(--tour-top, max(0.75rem, env(safe-area-inset-top)));
    left: var(--tour-left, 0.75rem);
    padding: clamp(0.75rem, 3vw, 1.25rem);
    color: #f8fafc;
    background: rgba(15, 23, 42, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 1rem;
    box-shadow: 0 16px 40px rgba(2, 8, 23, 0.32);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: top 220ms cubic-bezier(0.2, 0.75, 0.25, 1), left 220ms cubic-bezier(0.2, 0.75, 0.25, 1), width 180ms ease, max-height 180ms ease;
  }

  .tour-visibility-control {
    color: #dbeafe;
    border: 1px solid rgba(255, 255, 255, 0.24);
    background: rgba(15, 23, 42, 0.78);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: background-color 140ms ease, border-color 140ms ease, transform 140ms ease;
  }

  .tour-show-control {
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.24);
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: background-color 140ms ease, border-color 140ms ease, transform 140ms ease;
  }

  @media (min-width: 1024px) {
    .tour-show-control-centered {
      right: auto;
      left: 50%;
      transform: translateX(-50%);
    }

    .tour-show-control-centered:active {
      transform: translate(-50%, 1px);
    }
  }

  .tour-show-control:hover {
    background: rgba(30, 41, 59, 0.96);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .tour-show-control:active {
    transform: translateY(1px);
  }

  .tour-visibility-control:hover {
    background: rgba(30, 41, 59, 0.92);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .tour-visibility-control:active {
    transform: translateY(1px);
  }

  .tour-visibility-control:focus-visible {
    outline: 3px solid #7dd3fc;
    outline-offset: 2px;
  }

  .tour-show-control:focus-visible {
    outline: 3px solid #7dd3fc;
    outline-offset: 2px;
  }

  .tour-safe-area-probe {
    position: fixed;
    z-index: -1;
    width: 0;
    height: 0;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    visibility: hidden;
    pointer-events: none;
  }

  .tour-layout {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .tour-header {
    flex-shrink: 0;
  }

  .tour-content-region {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-top: 0.75rem;
    padding-bottom: 1rem;
    touch-action: pan-y;
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
    -webkit-overflow-scrolling: touch;
  }

  .tour-content-region::after {
    position: absolute;
    z-index: 1;
    inset: auto 0 0;
    height: 1.25em;
    content: '';
    opacity: 0;
    pointer-events: none;
    transition: opacity 160ms ease;
    backdrop-filter: blur(1px);
    -webkit-backdrop-filter: blur(1px);
    background: linear-gradient(to top, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.45) 35%, transparent);
  }

  /* :global(.tour-content-region.has-more-below)::after {
    opacity: 1;
  } */

  .tour-footer {
    position: relative;
    z-index: 2;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.75rem;
    margin-top: 0.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.16);
    background: transparent;
  }

  .tour-content-region:focus-visible {
    outline: 2px solid rgba(125, 211, 252, 0.8);
    outline-offset: -2px;
  }

  .tour-layout {
    animation: tour-step-in 180ms ease both;
  }

  .tour-primary {
    color: #081b2d;
    background: #5ee0d1;
    transition: background-color 140ms ease, transform 140ms ease;
  }

  .tour-primary:hover {
    background: #8af0e3;
  }

  .tour-primary:active,
  .tour-secondary:active {
    transform: translateY(1px);
  }

  .tour-secondary,
  .tour-icon {
    color: #e2e8f0;
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.04);
    transition: background-color 140ms ease, transform 140ms ease;
  }

  .tour-secondary:hover,
  .tour-icon:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .tour-primary:focus-visible,
  .tour-secondary:focus-visible,
  .tour-icon:focus-visible {
    outline: 3px solid #7dd3fc;
    outline-offset: 2px;
  }

  @keyframes tour-step-in {
    from {
      opacity: 0;
      transform: translateY(5px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tour-card,
    .tour-layout,
    .tour-content-region::after,
    .tour-show-control,
    .welcome-primary,
    .welcome-secondary {
      animation: none;
      transition: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .tour-content-region {
      scroll-behavior: smooth;
    }
  }
</style>
