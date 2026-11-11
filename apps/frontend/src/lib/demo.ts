export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: 'teal' | 'blue' | 'amber' | 'slate';
};

export const metrics: Metric[] = [
  { label: 'Total knowledge records', value: '6,480', delta: '+12.4% vs last quarter', tone: 'teal' },
  { label: 'Active projects', value: '18', delta: '3 flagged for review', tone: 'blue' },
  { label: 'Connected departments', value: '4', delta: 'cross-functional links live', tone: 'amber' },
  { label: 'Pending validations', value: '31', delta: '7 high priority', tone: 'slate' }
];

export const departments = [
  'Mechanical Engineering',
  'Electrical Engineering',
  'Software Engineering',
  'Manufacturing Engineering'
];

export const projects = [
  {
    name: 'Automotive Sensor Development',
    owner: 'Alex Morgan',
    departments: ['Mechanical Engineering', 'Electrical Engineering'],
    progress: 78,
    sprint: 'S5 - Calibration validation',
    issues: 12,
    documents: 9,
    risk: 'Thermal variance during validation'
  },
  {
    name: 'Embedded Sensor Software',
    owner: 'Sarah Chen',
    departments: ['Software Engineering', 'Electrical Engineering'],
    progress: 84,
    sprint: 'S4 - Firmware tuning',
    issues: 9,
    documents: 11,
    risk: 'Clock drift in low-noise mode'
  },
  {
    name: 'Sensor Manufacturing Integration',
    owner: 'David Miller',
    departments: ['Manufacturing Engineering', 'Mechanical Engineering'],
    progress: 68,
    sprint: 'S3 - Process capability ramp',
    issues: 7,
    documents: 8,
    risk: 'Inline test throughput below target'
  }
];

export const knowledgeDashboard = [
  { title: 'Housing redesign affects thermal profile', type: 'Engineering change', project: 'Automotive Sensor Development', status: 'validated' },
  { title: 'Calibration drift in low-noise firmware', type: 'Problem', project: 'Embedded Sensor Software', status: 'review pending' },
  { title: 'Production test fixture was redesigned for 2.3x throughput', type: 'Process', project: 'Sensor Manufacturing Integration', status: 'validated' },
  { title: 'PCB trace routing constraint flagged by electrical team', type: 'Requirement', project: 'Automotive Sensor Development', status: 'approved' }
];

export const decisions = [
  { title: 'Decision: switch from aluminum bracket to composite bracket', project: 'Automotive Sensor Development', owner: 'Alex Morgan', date: '2026-08-14' },
  { title: 'Decision: lock firmware timing to 10 kHz baseline', project: 'Embedded Sensor Software', owner: 'Sarah Chen', date: '2026-08-21' },
  { title: 'Decision: adopt inline sensor burn-in gate before packaging', project: 'Sensor Manufacturing Integration', owner: 'David Miller', date: '2026-09-03' }
];

export const graphData = [
  { id: 'department-mechanical', label: 'Mechanical', type: 'Department', group: 'department' },
  { id: 'department-electrical', label: 'Electrical', type: 'Department', group: 'department' },
  { id: 'department-software', label: 'Software', type: 'Department', group: 'department' },
  { id: 'department-manufacturing', label: 'Manufacturing', type: 'Department', group: 'department' },
  { id: 'alex', label: 'Alex Morgan', type: 'Employee', group: 'employee' },
  { id: 'sarah', label: 'Sarah Chen', type: 'Employee', group: 'employee' },
  { id: 'michael', label: 'Michael Weber', type: 'Employee', group: 'employee' },
  { id: 'david', label: 'David Miller', type: 'Employee', group: 'employee' },
  { id: 'project-1', label: 'Automotive Sensor Development', type: 'Project', group: 'project' },
  { id: 'project-2', label: 'Embedded Sensor Software', type: 'Project', group: 'project' },
  { id: 'project-3', label: 'Sensor Manufacturing Integration', type: 'Project', group: 'project' },
  { id: 'component-1', label: 'Thermal housing', type: 'Component', group: 'component' },
  { id: 'component-2', label: 'PCB sensor array', type: 'Component', group: 'component' },
  { id: 'component-3', label: 'Calibration stack', type: 'Component', group: 'component' },
  { id: 'decision-1', label: 'Composite housing selection', type: 'Decision', group: 'decision' },
  { id: 'decision-2', label: 'Firmware timing baseline', type: 'Decision', group: 'decision' }
];

export const graphEdges = [
  { source: 'department-mechanical', target: 'alex', label: 'BELONGS_TO' },
  { source: 'department-electrical', target: 'michael', label: 'BELONGS_TO' },
  { source: 'department-software', target: 'sarah', label: 'BELONGS_TO' },
  { source: 'department-manufacturing', target: 'david', label: 'BELONGS_TO' },
  { source: 'alex', target: 'project-1', label: 'WORKS_ON' },
  { source: 'sarah', target: 'project-2', label: 'WORKS_ON' },
  { source: 'david', target: 'project-3', label: 'WORKS_ON' },
  { source: 'project-1', target: 'component-1', label: 'AFFECTS' },
  { source: 'project-2', target: 'component-2', label: 'AFFECTS' },
  { source: 'project-3', target: 'component-3', label: 'AFFECTS' },
  { source: 'component-1', target: 'decision-1', label: 'VALIDATED_BY' },
  { source: 'component-2', target: 'decision-2', label: 'VALIDATED_BY' },
  { source: 'decision-1', target: 'component-3', label: 'APPLIES_TO' },
  { source: 'project-1', target: 'project-2', label: 'DEPENDS_ON' }
];

export const knowledgeRecords = [
  {
    title: 'Thermal housing redesign reduces sensor drifting',
    type: 'Decision',
    department: 'Mechanical Engineering',
    project: 'Automotive Sensor Development',
    source: 'Design review; thermal model',
    validation: 'validated',
    owner: 'Alex Morgan'
  },
  {
    title: 'Firmware calibration issue linked to sensor noise floor',
    type: 'Problem',
    department: 'Software Engineering',
    project: 'Embedded Sensor Software',
    source: 'Jira ENG-1172',
    validation: 'review pending',
    owner: 'Sarah Chen'
  },
  {
    title: 'Inline burn-in gate required before final packaging',
    type: 'Requirement',
    department: 'Manufacturing Engineering',
    project: 'Sensor Manufacturing Integration',
    source: 'MSA sample study',
    validation: 'validated',
    owner: 'David Miller'
  }
];

export const people = [
  { name: 'Alex Morgan', role: 'Senior Mechanical Engineer', department: 'Mechanical Engineering', experience: '12 years', projects: ['Project Alpha — Sensor Housing'], risk: 'low' },
  { name: 'Sarah Chen', role: 'Embedded Software Engineer', department: 'Software Engineering', experience: '8 years', projects: ['Project Beta — Embedded Calibration'], risk: 'medium' },
  { name: 'Michael Weber', role: 'Electrical Engineer', department: 'Electrical Engineering', experience: '10 years', projects: ['Project Alpha — Sensor Housing', 'Project Beta — Embedded Calibration'], risk: 'low' },
  { name: 'David Miller', role: 'Manufacturing Engineer', department: 'Manufacturing Engineering', experience: '7 years', projects: ['Project Gamma — Manufacturing Scale-up'], risk: 'medium' }
];

export const assistantExamples = [
  'What mechanical changes have affected software development?',
  'Have we encountered similar sensor calibration issues before?',
  'Which other projects have solved similar problems?',
  'What knowledge does Alex Morgan possess that should be handed over?'
];
