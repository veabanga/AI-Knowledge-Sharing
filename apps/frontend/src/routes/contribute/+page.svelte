<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Save } from 'lucide-svelte';
  import { knowledgeDepartments, knowledgeProjects, type KnowledgeRecord } from '$lib/knowledge';
  import { addKnowledgeRecord, knowledgeStore } from '$lib/knowledge-store';
  import { continueTourWithRecord, tourAction, tourState, tourTipVisible } from '$lib/tour';

  type IssueStatus = 'resolved' | 'unresolved';
  type FormErrors = Record<string, string>;

  const teams = knowledgeDepartments;
  const commonDefaults = () => ({
    title: '',
    problem: '',
    detailedContext: '',
    department: '',
    project: '',
    category: '',
    tags: '',
    contributorName: '',
    occurredAt: new Date().toISOString().slice(0, 10),
    evidence: '',
    relatedRecordIds: [] as string[],
    relatedIssues: '',
    resolved: {
      rootCause: '',
      solution: '',
      stepsTaken: '',
      validationMethod: '',
      validationOutcome: '',
      lessons: '',
      recommendations: ''
    },
    unresolved: {
      investigation: '',
      attemptedApproaches: '',
      unsuccessfulApproaches: '',
      blocker: '',
      supportNeeded: '',
      nextSteps: '',
      relatedDepartments: [] as string[]
    }
  });

  let issueStatus: IssueStatus = 'resolved';
  let stage: 'edit' | 'review' | 'success' = 'edit';
  let form = commonDefaults();
  let errors: FormErrors = {};
  let errorSummary = '';
  let saveError = '';
  let isSaving = false;
  let createdRecord: KnowledgeRecord | undefined;

  $: availableProjects = [...new Set([...knowledgeProjects, ...$knowledgeStore.map((record) => record.project)])];
  $: relatedRecords = $knowledgeStore.filter((record) => record.id !== createdRecord?.id);

  onMount(() => {
    try {
      knowledgeStore.load();
    } catch (error) {
      saveError = error instanceof Error ? error.message : 'Could not load browser contributions.';
    }
  });

  function setStatus(status: IssueStatus) {
    issueStatus = status;
    errors = {};
    errorSummary = '';
  }

  function fillSampleData() {
    if ($tourState.active) tourTipVisible.set(false);
    issueStatus = 'resolved';
    form = {
      ...commonDefaults(),
      title: 'Sensor controller overheating during extended operation',
      problem: 'The controller exceeded its operating temperature during a sustained high-load test.',
      detailedContext: 'A fictional demo issue observed during a 4-hour bench test at elevated ambient temperature. The controller was installed in the revised compact enclosure.',
      department: teams[0] ?? '',
      project: knowledgeProjects[0] ?? '',
      category: 'Thermal design',
      tags: 'thermal, controller, enclosure',
      contributorName: 'Alex Morgan',
      resolved: {
        rootCause: 'The revised enclosure reduced airflow around the controller heat sink.',
        solution: 'Added a ventilation path and increased clearance around the heat sink.',
        stepsTaken: 'Reproduced the temperature rise under sustained load.\nCompared airflow with the previous enclosure.\nUpdated the enclosure and repeated the test.',
        validationMethod: 'Repeated the 4-hour high-load bench test at the same ambient temperature.',
        validationOutcome: 'The controller remained within its specified operating temperature for the full test.',
        lessons: 'Re-check thermal airflow and component clearance whenever enclosure geometry changes.',
        recommendations: 'Include a sustained-load thermal test in enclosure design verification.'
      }
    };
    errors = {};
    errorSummary = '';
    saveError = '';
  }

  function clearError(field: string) {
    if (!errors[field]) return;
    const next = { ...errors };
    delete next[field];
    errors = next;
    errorSummary = Object.keys(next).length ? 'Please fix the highlighted fields before reviewing.' : '';
  }

  function validate() {
    const next: FormErrors = {};
    const requiredCommon: [string, string, string][] = [
      ['title', 'Knowledge title', form.title],
      ['problem', 'Short problem description', form.problem],
      ['detailedContext', 'Detailed problem context', form.detailedContext],
      ['department', 'Department', form.department],
      ['project', 'Project', form.project],
      ['category', 'Engineering domain or category', form.category],
      ['contributorName', 'Contributor name', form.contributorName],
      ['occurredAt', 'Date of occurrence', form.occurredAt]
    ];
    for (const [key, label, value] of requiredCommon) {
      if (!value.trim()) next[key] = `${label} is required.`;
    }
    if (issueStatus === 'resolved') {
      if (!form.resolved.rootCause.trim()) next.rootCause = 'Root cause is required for a resolved issue.';
      if (!form.resolved.solution.trim()) next.solution = 'Solution implemented is required for a resolved issue.';
      if (!form.resolved.validationMethod.trim()) next.validationMethod = 'Describe how the solution was validated.';
      if (!form.resolved.validationOutcome.trim()) next.validationOutcome = 'Add the validation outcome.';
      if (!form.resolved.lessons.trim()) next.lessons = 'Add at least one lesson learned.';
    } else {
      if (!form.unresolved.investigation.trim()) next.investigation = 'Describe what has already been investigated.';
      if (!form.unresolved.attemptedApproaches.trim()) next.attemptedApproaches = 'Describe the approaches already attempted.';
      if (!form.unresolved.unsuccessfulApproaches.trim()) next.unsuccessfulApproaches = 'Describe what did not work.';
      if (!form.unresolved.blocker.trim()) next.blocker = 'Describe the current blocker.';
      if (!form.unresolved.supportNeeded.trim()) next.supportNeeded = 'Describe the expertise or support needed.';
      if (!form.unresolved.nextSteps.trim()) next.nextSteps = 'Suggest a next step, even if it is to review with a team.';
    }
    errors = next;
    errorSummary = Object.keys(next).length ? 'Please fix the highlighted fields before reviewing.' : '';
    return Object.keys(next).length === 0;
  }

  function goToReview(event: SubmitEvent) {
    event.preventDefault();
    saveError = '';
    if (validate()) {
      stage = 'review';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function splitReferences(value: string) {
    return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((title, index) => {
      const separator = title.indexOf(':');
      return separator > 0
        ? { id: title.slice(0, separator).trim(), title: title.slice(separator + 1).trim() }
        : { id: `CONTRIB-${index + 1}`, title };
    });
  }

  function toggleRelatedDepartment(department: string) {
    const current = form.unresolved.relatedDepartments;
    form.unresolved.relatedDepartments = current.includes(department)
      ? current.filter((value) => value !== department)
      : [...current, department];
    form = { ...form, unresolved: { ...form.unresolved } };
  }

  async function submitContribution() {
    if (isSaving || !validate()) return;
    isSaving = true;
    saveError = '';
    try {
      const resolved = issueStatus === 'resolved';
      const sourceReference = form.evidence.trim();
      const relatedRecordIds = [...new Set(form.relatedRecordIds.filter((id) => relatedRecords.some((record) => record.id === id)))];
      createdRecord = addKnowledgeRecord({
        title: form.title.trim(),
        type: resolved ? 'Solution' : 'Problem',
        department: form.department,
        project: form.project,
        component: form.category.trim(),
        problem: form.problem.trim(),
        detailedContext: form.detailedContext.trim(),
        rootCause: resolved ? form.resolved.rootCause.trim() : 'Not yet identified',
        solution: resolved ? form.resolved.solution.trim() : 'No validated solution recorded yet.',
        validation: {
          status: resolved ? 'Validated' : 'Unresolved',
          summary: resolved
            ? form.resolved.validationOutcome.trim()
            : `Open investigation. Current blocker: ${form.unresolved.blocker.trim()}`
        },
        lessons: resolved ? form.resolved.lessons.trim() : `Open issue. Support needed: ${form.unresolved.supportNeeded.trim()}`,
        tags: [...new Set(form.tags.split(',').map((tag) => tag.trim()).filter(Boolean))],
        relatedIssues: splitReferences(form.relatedIssues),
        relatedRecordIds,
        sources: sourceReference
          ? [{ title: 'Contributor-provided source reference', reference: sourceReference, kind: 'Manual reference' }]
          : [],
        author: form.contributorName.trim(),
        contributorName: form.contributorName.trim(),
        occurredAt: form.occurredAt,
        category: form.category.trim(),
        stepsTaken: resolved ? form.resolved.stepsTaken.trim() : undefined,
        validationMethod: resolved ? form.resolved.validationMethod.trim() : undefined,
        validationOutcome: resolved ? form.resolved.validationOutcome.trim() : undefined,
        recommendations: resolved ? form.resolved.recommendations.trim() : undefined,
        investigation: !resolved ? form.unresolved.investigation.trim() : undefined,
        attemptedApproaches: !resolved ? form.unresolved.attemptedApproaches.trim() : undefined,
        unsuccessfulApproaches: !resolved ? form.unresolved.unsuccessfulApproaches.trim() : undefined,
        blocker: !resolved ? form.unresolved.blocker.trim() : undefined,
        supportNeeded: !resolved ? form.unresolved.supportNeeded.trim() : undefined,
        nextSteps: !resolved ? form.unresolved.nextSteps.trim() : undefined,
        relatedDepartments: !resolved ? form.unresolved.relatedDepartments : []
      });
      stage = 'success';
      if ($tourState.active && $tourState.step === 7) {
        continueTourWithRecord(createdRecord.id);
        await goto(`${base}/discovery/`);
        tourAction.set('open-created-record');
      }
    } catch (error) {
      saveError = error instanceof Error ? error.message : 'The contribution could not be saved.';
    } finally {
      isSaving = false;
    }
  }

  function startAnother() {
    issueStatus = 'resolved';
    form = commonDefaults();
    stage = 'edit';
    errors = {};
    errorSummary = '';
    createdRecord = undefined;
  }

  const fieldClass = (name: string) => `mt-1 block min-h-11 w-full rounded-xl border ${errors[name] ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-slate-50'} px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100`;
</script>

<svelte:head>
  <title>Nexus Knowledge | Contribute Knowledge</title>
  <meta name="description" content="Contribute fictional Auron Mobility engineering knowledge to this browser." />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6 pb-32 sm:pb-24">
  <header>
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">Manual knowledge capture · Browser-only MVP</p>
    <h1 class="mt-2 text-3xl font-semibold text-slate-900">Contribute engineering knowledge</h1>
    <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Share a solution that may help another team, or document an issue where you need support. Contributions are stored in this browser only—not shared with colleagues or saved to a central company database.</p>
  </header>

  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
    <strong>Prototype storage:</strong> Your contribution will persist in this browser’s LocalStorage and will be searchable from Knowledge Discovery on this device. It is not uploaded or independently verified.
  </div>

  {#if saveError}<div role="alert" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{saveError}</div>{/if}

  {#if stage === 'success' && createdRecord}
    <section class="rounded-2xl border border-emerald-200 bg-white p-6 shadow-panel sm:p-8" aria-live="polite">
      <div class="flex items-start gap-4"><CheckCircle2 size={26} class="mt-1 shrink-0 text-emerald-700" /><div><h2 class="text-xl font-semibold text-slate-900">Knowledge contribution saved</h2><p class="mt-2 text-sm leading-6 text-slate-600">“{createdRecord.title}” is now in this browser’s searchable knowledge collection.</p><p class="mt-2 text-xs text-slate-500">Record ID: {createdRecord.id} · Stored in LocalStorage · {createdRecord.sourceType}</p></div></div>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <a class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800" href={`${base}/discovery/?record=${encodeURIComponent(createdRecord.id)}`}>View in Knowledge Discovery <ArrowRight size={16} /></a>
        <button class="min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" on:click={startAnother}>Contribute another</button>
      </div>
    </section>
  {:else}
    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel sm:p-6">
      {#if stage === 'edit'}
        <div class="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div><h2 class="text-lg font-semibold text-slate-900">What would you like to contribute?</h2><p class="mt-1 text-sm text-slate-500">Choose the state that best describes the engineering issue.</p></div>
          <span class="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Step 1 · Details</span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" class={`min-h-[76px] rounded-xl border p-4 text-left transition ${issueStatus === 'resolved' ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 hover:bg-slate-50'}`} aria-pressed={issueStatus === 'resolved'} on:click={() => setStatus('resolved')}>
            <span class="block font-semibold text-slate-900">Resolved engineering issue</span><span class="mt-1 block text-xs leading-5 text-slate-600">Capture a root cause, implemented solution and validation evidence.</span>
          </button>
          <button type="button" class={`min-h-[76px] rounded-xl border p-4 text-left transition ${issueStatus === 'unresolved' ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 hover:bg-slate-50'}`} aria-pressed={issueStatus === 'unresolved'} on:click={() => setStatus('unresolved')}>
            <span class="block font-semibold text-slate-900">Unresolved / stuck engineering issue</span><span class="mt-1 block text-xs leading-5 text-slate-600">Document what you tried, the blocker and the expertise needed.</span>
          </button>
        </div>
        <div class="mt-4 flex flex-col gap-2 rounded-xl border border-teal-100 bg-teal-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-700">Want to try the form quickly? Fill it with an editable fictional example.</p>
          <button data-tour="contribution-sample" type="button" class="min-h-11 shrink-0 rounded-lg border border-teal-800 bg-white px-4 py-2 text-sm font-semibold text-teal-950 hover:bg-teal-50" on:click={fillSampleData}>Fill with sample data</button>
        </div>

        <form data-tour="contribution-form" class="mt-6 space-y-7" novalidate on:submit={goToReview}>
          <section>
            <h3 class="text-base font-semibold text-slate-900">Knowledge summary</h3><p class="mt-1 text-xs text-slate-500">Required fields are marked with an asterisk (*).</p>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2"><label for="title" class="text-sm font-medium text-slate-800">Knowledge title *</label><input id="title" class={fieldClass('title')} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} bind:value={form.title} on:input={() => clearError('title')} placeholder="e.g. Sensor board overheating after housing change" />{#if errors.title}<p id="title-error" class="mt-1 text-xs text-rose-700">{errors.title}</p>{/if}</div>
              <div><label for="problem" class="text-sm font-medium text-slate-800">Short problem description *</label><textarea id="problem" rows="3" class={fieldClass('problem')} aria-invalid={Boolean(errors.problem)} aria-describedby={errors.problem ? 'problem-error' : undefined} bind:value={form.problem} on:input={() => clearError('problem')} placeholder="What happened? State the observable symptom."></textarea>{#if errors.problem}<p id="problem-error" class="mt-1 text-xs text-rose-700">{errors.problem}</p>{/if}</div>
              <div><label for="detailed-context" class="text-sm font-medium text-slate-800">Detailed problem context *</label><textarea id="detailed-context" rows="3" class={fieldClass('detailedContext')} aria-invalid={Boolean(errors.detailedContext)} aria-describedby={errors.detailedContext ? 'context-error' : undefined} bind:value={form.detailedContext} on:input={() => clearError('detailedContext')} placeholder="Conditions, impact, component revision, operating profile…"></textarea>{#if errors.detailedContext}<p id="context-error" class="mt-1 text-xs text-rose-700">{errors.detailedContext}</p>{/if}</div>
              <div><label for="department" class="text-sm font-medium text-slate-800">Department *</label><select id="department" class={fieldClass('department')} aria-invalid={Boolean(errors.department)} bind:value={form.department} on:change={() => clearError('department')}><option value="">Select a department</option>{#each teams as team}<option value={team}>{team.replace(' Engineering', '')}</option>{/each}</select>{#if errors.department}<p class="mt-1 text-xs text-rose-700">{errors.department}</p>{/if}</div>
              <div><label for="project" class="text-sm font-medium text-slate-800">Auron Mobility demo project *</label><select id="project" class={fieldClass('project')} aria-invalid={Boolean(errors.project)} bind:value={form.project} on:change={() => clearError('project')}><option value="">Select a project</option>{#each availableProjects as project}<option value={project}>{project}</option>{/each}</select>{#if errors.project}<p class="mt-1 text-xs text-rose-700">{errors.project}</p>{/if}</div>
              <div><label for="category" class="text-sm font-medium text-slate-800">Engineering domain or category *</label><input id="category" class={fieldClass('category')} aria-invalid={Boolean(errors.category)} bind:value={form.category} on:input={() => clearError('category')} placeholder="e.g. Thermal design, firmware calibration" />{#if errors.category}<p class="mt-1 text-xs text-rose-700">{errors.category}</p>{/if}</div>
              <div><label for="contributor" class="text-sm font-medium text-slate-800">Contributor name *</label><input id="contributor" class={fieldClass('contributorName')} aria-invalid={Boolean(errors.contributorName)} bind:value={form.contributorName} on:input={() => clearError('contributorName')} placeholder="Name for this fictional demo record" />{#if errors.contributorName}<p class="mt-1 text-xs text-rose-700">{errors.contributorName}</p>{/if}</div>
              <div><label for="occurred-at" class="text-sm font-medium text-slate-800">Date of occurrence *</label><input id="occurred-at" type="date" class={fieldClass('occurredAt')} aria-invalid={Boolean(errors.occurredAt)} bind:value={form.occurredAt} on:change={() => clearError('occurredAt')} />{#if errors.occurredAt}<p class="mt-1 text-xs text-rose-700">{errors.occurredAt}</p>{/if}</div>
              <div><label for="tags" class="text-sm font-medium text-slate-800">Relevant tags <span class="font-normal text-slate-500">(optional, comma separated)</span></label><input id="tags" class={fieldClass('tags')} bind:value={form.tags} placeholder="thermal, PCB, clearance" /></div>
              <div class="sm:col-span-2"><label for="evidence" class="text-sm font-medium text-slate-800">Supporting evidence or source reference <span class="font-normal text-slate-500">(optional)</span></label><input id="evidence" class={fieldClass('evidence')} bind:value={form.evidence} placeholder="e.g. Demo test report TR-120, drawing revision C" /><p class="mt-1 text-xs text-slate-500">Enter a reference only. Nexus will not upload or parse documents in this prototype.</p></div>
              <div class="sm:col-span-2"><label for="related-issues" class="text-sm font-medium text-slate-800">Related issue references <span class="font-normal text-slate-500">(optional, one per line; prefix ID with a colon)</span></label><textarea id="related-issues" rows="2" class={fieldClass('relatedIssues')} bind:value={form.relatedIssues} placeholder="DEMO-123: Thermal test failure&#10;Engineering change EC-42" ></textarea></div>
              {#if relatedRecords.length}
                <fieldset class="sm:col-span-2"><legend class="text-sm font-medium text-slate-800">Related knowledge records <span class="font-normal text-slate-500">(optional; use Ctrl/Cmd to select more than one)</span></legend><select multiple size="4" class={fieldClass('relatedRecordIds')} bind:value={form.relatedRecordIds}>{#each relatedRecords as record}<option value={record.id}>{record.title} · {record.project}</option>{/each}</select></fieldset>
              {/if}
            </div>
          </section>

          {#if issueStatus === 'resolved'}
            <section class="border-t border-slate-100 pt-6">
              <h3 class="text-base font-semibold text-slate-900">Resolution and validation</h3><p class="mt-1 text-sm text-slate-500">Capture what changed and how the team verified it.</p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label for="root-cause" class="text-sm font-medium text-slate-800">Root cause *</label><textarea id="root-cause" rows="3" class={fieldClass('rootCause')} aria-invalid={Boolean(errors.rootCause)} bind:value={form.resolved.rootCause} on:input={() => clearError('rootCause')} placeholder="What mechanism or condition caused the problem?"></textarea>{#if errors.rootCause}<p class="mt-1 text-xs text-rose-700">{errors.rootCause}</p>{/if}</div>
                <div><label for="solution" class="text-sm font-medium text-slate-800">Solution implemented *</label><textarea id="solution" rows="3" class={fieldClass('solution')} aria-invalid={Boolean(errors.solution)} bind:value={form.resolved.solution} on:input={() => clearError('solution')} placeholder="What change resolved or mitigated the issue?"></textarea>{#if errors.solution}<p class="mt-1 text-xs text-rose-700">{errors.solution}</p>{/if}</div>
                <div><label for="steps-taken" class="text-sm font-medium text-slate-800">Steps taken <span class="font-normal text-slate-500">(optional)</span></label><textarea id="steps-taken" rows="3" class={fieldClass('stepsTaken')} bind:value={form.resolved.stepsTaken} placeholder="One step per line: reproduce, isolate, adjust…" ></textarea></div>
                <div><label for="validation-method" class="text-sm font-medium text-slate-800">Validation method *</label><textarea id="validation-method" rows="3" class={fieldClass('validationMethod')} aria-invalid={Boolean(errors.validationMethod)} bind:value={form.resolved.validationMethod} on:input={() => clearError('validationMethod')} placeholder="Test conditions, sample size, equipment or procedure…"></textarea>{#if errors.validationMethod}<p class="mt-1 text-xs text-rose-700">{errors.validationMethod}</p>{/if}</div>
                <div><label for="validation-outcome" class="text-sm font-medium text-slate-800">Validation outcome *</label><textarea id="validation-outcome" rows="3" class={fieldClass('validationOutcome')} aria-invalid={Boolean(errors.validationOutcome)} bind:value={form.resolved.validationOutcome} on:input={() => clearError('validationOutcome')} placeholder="What passed? Include measured result or acceptance criteria."></textarea>{#if errors.validationOutcome}<p class="mt-1 text-xs text-rose-700">{errors.validationOutcome}</p>{/if}</div>
                <div><label for="lessons" class="text-sm font-medium text-slate-800">Lessons learned *</label><textarea id="lessons" rows="3" class={fieldClass('lessons')} aria-invalid={Boolean(errors.lessons)} bind:value={form.resolved.lessons} on:input={() => clearError('lessons')} placeholder="What should another project know before facing this?"></textarea>{#if errors.lessons}<p class="mt-1 text-xs text-rose-700">{errors.lessons}</p>{/if}</div>
                <div class="sm:col-span-2"><label for="recommendations" class="text-sm font-medium text-slate-800">Reusable recommendations <span class="font-normal text-slate-500">(optional)</span></label><textarea id="recommendations" rows="2" class={fieldClass('recommendations')} bind:value={form.resolved.recommendations} placeholder="Practical checks, design rules or conditions for reuse…" ></textarea></div>
              </div>
            </section>
          {:else}
            <section class="border-t border-slate-100 pt-6">
              <h3 class="text-base font-semibold text-slate-900">Open investigation</h3><p class="mt-1 text-sm text-slate-500">A root cause or solution is not required for an unresolved issue.</p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label for="investigation" class="text-sm font-medium text-slate-800">What has already been investigated? *</label><textarea id="investigation" rows="3" class={fieldClass('investigation')} aria-invalid={Boolean(errors.investigation)} bind:value={form.unresolved.investigation} on:input={() => clearError('investigation')} placeholder="Checks completed, conditions reviewed, data collected…"></textarea>{#if errors.investigation}<p class="mt-1 text-xs text-rose-700">{errors.investigation}</p>{/if}</div>
                <div><label for="attempted" class="text-sm font-medium text-slate-800">What approaches have been attempted? *</label><textarea id="attempted" rows="3" class={fieldClass('attemptedApproaches')} aria-invalid={Boolean(errors.attemptedApproaches)} bind:value={form.unresolved.attemptedApproaches} on:input={() => clearError('attemptedApproaches')} placeholder="List experiments, design changes or analysis attempted."></textarea>{#if errors.attemptedApproaches}<p class="mt-1 text-xs text-rose-700">{errors.attemptedApproaches}</p>{/if}</div>
                <div><label for="unsuccessful" class="text-sm font-medium text-slate-800">What did not work? *</label><textarea id="unsuccessful" rows="3" class={fieldClass('unsuccessfulApproaches')} aria-invalid={Boolean(errors.unsuccessfulApproaches)} bind:value={form.unresolved.unsuccessfulApproaches} on:input={() => clearError('unsuccessfulApproaches')} placeholder="Record unsuccessful approaches so others do not repeat them."></textarea>{#if errors.unsuccessfulApproaches}<p class="mt-1 text-xs text-rose-700">{errors.unsuccessfulApproaches}</p>{/if}</div>
                <div><label for="blocker" class="text-sm font-medium text-slate-800">Current blocker *</label><textarea id="blocker" rows="3" class={fieldClass('blocker')} aria-invalid={Boolean(errors.blocker)} bind:value={form.unresolved.blocker} on:input={() => clearError('blocker')} placeholder="What is preventing progress right now?"></textarea>{#if errors.blocker}<p class="mt-1 text-xs text-rose-700">{errors.blocker}</p>{/if}</div>
                <div><label for="support" class="text-sm font-medium text-slate-800">What support or expertise is needed? *</label><textarea id="support" rows="3" class={fieldClass('supportNeeded')} aria-invalid={Boolean(errors.supportNeeded)} bind:value={form.unresolved.supportNeeded} on:input={() => clearError('supportNeeded')} placeholder="Describe the question or expertise that could help."></textarea>{#if errors.supportNeeded}<p class="mt-1 text-xs text-rose-700">{errors.supportNeeded}</p>{/if}</div>
                <div><label for="next-steps" class="text-sm font-medium text-slate-800">Suggested next steps *</label><textarea id="next-steps" rows="3" class={fieldClass('nextSteps')} aria-invalid={Boolean(errors.nextSteps)} bind:value={form.unresolved.nextSteps} on:input={() => clearError('nextSteps')} placeholder="Propose an experiment, review or decision to move forward."></textarea>{#if errors.nextSteps}<p class="mt-1 text-xs text-rose-700">{errors.nextSteps}</p>{/if}</div>
                <fieldset class="sm:col-span-2"><legend class="text-sm font-medium text-slate-800">Relevant departments or teams <span class="font-normal text-slate-500">(optional)</span></legend><div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{#each teams as team}<label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={form.unresolved.relatedDepartments.includes(team)} on:change={() => toggleRelatedDepartment(team)} />{team.replace(' Engineering', '')}</label>{/each}</div></fieldset>
              </div>
            </section>
          {/if}

          {#if errorSummary}<div class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900" role="alert">{errorSummary}</div>{/if}
          <div class="contribution-actions">
            <a href={`${base}/discovery/`} class="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:w-auto">Cancel</a>
            <button type="submit" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-teal-800 bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-950 hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 sm:w-auto"><ChevronRight size={16} />Review contribution</button>
          </div>
        </form>
      {:else}
        <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-5"><div><h2 class="text-lg font-semibold text-slate-900">Review your contribution</h2><p class="mt-1 text-sm text-slate-500">Confirm the details before saving this record to this browser.</p></div><span class="w-fit shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">Step 2 · Review</span></div>
        <div class="mt-5 space-y-5">
          <section><h3 class="font-semibold text-slate-900">Knowledge summary</h3><dl class="mt-2 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><dt class="text-xs text-slate-500">Issue state</dt><dd class="mt-1 font-medium">{issueStatus === 'resolved' ? 'Resolved engineering issue' : 'Unresolved / stuck issue'}</dd></div><div><dt class="text-xs text-slate-500">Title</dt><dd class="mt-1 font-medium">{form.title}</dd></div><div><dt class="text-xs text-slate-500">Department</dt><dd class="mt-1">{form.department}</dd></div><div><dt class="text-xs text-slate-500">Project</dt><dd class="mt-1">{form.project}</dd></div><div><dt class="text-xs text-slate-500">Domain</dt><dd class="mt-1">{form.category}</dd></div><div><dt class="text-xs text-slate-500">Contributor / occurrence</dt><dd class="mt-1">{form.contributorName} · {form.occurredAt}</dd></div><div class="sm:col-span-2"><dt class="text-xs text-slate-500">Problem</dt><dd class="mt-1 whitespace-pre-line">{form.problem}<br />{form.detailedContext}</dd></div><div class="sm:col-span-2"><dt class="text-xs text-slate-500">{issueStatus === 'resolved' ? 'Root cause and solution' : 'Investigation and blocker'}</dt><dd class="mt-1 whitespace-pre-line">{issueStatus === 'resolved' ? `${form.resolved.rootCause}\n${form.resolved.solution}` : `${form.unresolved.investigation}\n${form.unresolved.blocker}`}</dd></div></dl></section>
          <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">Submitting creates a unique record and stores it in this browser’s LocalStorage. It becomes searchable immediately and is not sent to any service.</div>
          <div class="contribution-actions"><button class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50" on:click={() => (stage = 'edit')}><ChevronLeft size={16} />Back to editing</button><button class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-teal-800 bg-teal-50 px-5 py-2.5 text-sm font-bold text-teal-950 hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} on:click={submitContribution}><Save size={16} />{isSaving ? 'Saving…' : 'Confirm and save contribution'}</button></div>
        </div>

      {/if}
    </section>
  {/if}
</div>

<style>
  .contribution-actions {
    position: fixed;
    z-index: 40;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column-reverse;
    gap: 0.75rem;
    padding: 1rem 1rem max(1rem, env(safe-area-inset-bottom));
    border-top: 1px solid #cbd5e1;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 -8px 20px rgba(15, 23, 42, 0.12);
  }

  .contribution-actions > :global(button),
  .contribution-actions > :global(a) {
    width: 100%;
    min-height: 3rem;
  }

  .contribution-actions > :global(button:last-child) {
    color: #042f2e;
    background: #ccfbf1;
    border: 2px solid #0f766e;
  }

  .contribution-actions > :global(button:last-child:hover:not(:disabled)) {
    background: #99f6e4;
  }

  .contribution-actions > :global(button:last-child:focus-visible) {
    outline: 3px solid #0f766e;
    outline-offset: 3px;
  }

  @media (min-width: 640px) {
    .contribution-actions {
      flex-direction: row;
      justify-content: space-between;
    }

    .contribution-actions > :global(button),
    .contribution-actions > :global(a) {
      width: auto;
    }
  }

  @media (min-width: 1024px) {
    .contribution-actions {
      left: 18rem;
    }
  }
</style>
