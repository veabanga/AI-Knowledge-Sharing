import {
  knowledgeDepartments,
  knowledgeProjects,
  knowledgeRecords
} from './knowledge';

type GraphScope = { departments: string[]; projects: string[] };
export type GraphKnowledge = {
  title: string;
  knowledgeType: string;
  description: string;
  explanation: string;
  component: string;
  source: string;
  validation: string;
};

const slug = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const departmentNodeId = (department: string) => `department-${slug(department)}`;
const projectNodeId = (project: string) => `project-${slug(project)}`;

export const graphData = [
  ...knowledgeDepartments.map((department) => ({
    id: departmentNodeId(department),
    label: department.replace(' Engineering', ''),
    type: 'Department',
    group: 'department'
  })),
  ...knowledgeProjects.map((project) => ({
    id: projectNodeId(project),
    label: project.split(' — ')[0],
    type: 'Project',
    group: 'project'
  })),
  ...knowledgeRecords.map((record) => ({
    id: record.id,
    label: record.title.split(/\s+/).slice(0, 2).join(' ') + '…',
    type: record.type,
    group: 'knowledge'
  }))
];

export const graphEdges = [
  ...knowledgeRecords.flatMap((record) => [
    { source: departmentNodeId(record.department), target: record.id, label: 'CONTRIBUTES_TO' },
    { source: projectNodeId(record.project), target: record.id, label: 'CAPTURED_IN' }
  ]),
  ...knowledgeRecords.flatMap((record) =>
    record.relatedRecordIds
      .filter((relatedId) => record.id < relatedId)
      .map((relatedId) => ({ source: record.id, target: relatedId, label: 'RELATED_TO' }))
  )
];

export const graphNodeScopes: Record<string, GraphScope> = {
  ...Object.fromEntries(knowledgeDepartments.map((department) => [
    departmentNodeId(department),
    {
      departments: [department],
      projects: [...new Set(knowledgeRecords.filter((record) => record.department === department).map((record) => record.project))]
    }
  ])),
  ...Object.fromEntries(knowledgeProjects.map((project) => [
    projectNodeId(project),
    {
      departments: [...new Set(knowledgeRecords.filter((record) => record.project === project).map((record) => record.department))],
      projects: [project]
    }
  ])),
  ...Object.fromEntries(knowledgeRecords.map((record) => [
    record.id,
    { departments: [record.department], projects: [record.project] }
  ]))
};

const departmentDetails: Record<string, GraphKnowledge> = {
  'Mechanical Engineering': {
    title: 'Mechanical Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering enclosure design, materials and mechanical interfaces.',
    explanation: 'Its records connect housing, thermal and tolerance decisions with electrical and manufacturing teams.',
    component: 'Sensor enclosure and mechanical interfaces',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  },
  'Electrical Engineering': {
    title: 'Electrical Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering PCB layout, sensor interfaces and electrical validation.',
    explanation: 'Its records link PCB heat, keepout and connector issues across sensor projects.',
    component: 'PCB sensor array and electrical interfaces',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  },
  'Software Engineering': {
    title: 'Software Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering embedded firmware and sensor calibration.',
    explanation: 'Its records capture calibration drift, cold start and timing lessons for reuse.',
    component: 'Sensor calibration firmware',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  },
  'Manufacturing Engineering': {
    title: 'Manufacturing Engineering',
    knowledgeType: 'Department',
    description: 'Auron Mobility demo department covering production readiness and manufacturing validation.',
    explanation: 'Its records connect line test failures and process checks with upstream product design.',
    component: 'Production test and assembly processes',
    source: 'Fictional Auron Mobility demo dataset',
    validation: 'Demo data'
  }
};

export const graphNodeKnowledge: Record<string, GraphKnowledge> = {
  ...Object.fromEntries(knowledgeDepartments.map((department) => [departmentNodeId(department), departmentDetails[department]])),
  ...Object.fromEntries(knowledgeProjects.map((project) => {
    const records = knowledgeRecords.filter((record) => record.project === project);
    return [projectNodeId(project), {
      title: project,
      knowledgeType: 'Project',
      description: `${records.length} fictional Auron Mobility records are associated with this project.`,
      explanation: [...new Set(records.map((record) => record.title))].join('; '),
      component: [...new Set(records.map((record) => record.component))].join(', '),
      source: 'Fictional Auron Mobility project and knowledge records',
      validation: `${records.filter((record) => record.validation.status === 'Validated').length} validated · ${records.filter((record) => record.validation.status !== 'Validated').length} open or in progress`
    }];
  })),
  ...Object.fromEntries(knowledgeRecords.map((record) => [
    record.id,
    {
      title: record.title,
      knowledgeType: record.type,
      description: record.problem,
      explanation: `Root cause: ${record.rootCause} Solution: ${record.solution}`,
      component: record.component,
      source: record.sources.map((source) => `${source.title} (${source.reference})`).join('; '),
      validation: record.validation.status
    }
  ]))
};

export { knowledgeDepartments, knowledgeProjects };
