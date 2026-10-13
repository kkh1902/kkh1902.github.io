export const SITE_TITLE = 'huni.log';
export const SITE_DESCRIPTION = 'AI 엔지니어 김기훈의 개발·에이전트·커리어 기록';

export interface TaxonomyNode {
  key: string;
  label: string;
  children?: TaxonomyNode[];
}

export const TAXONOMY: TaxonomyNode[] = [
  { key: 'ai-dev', label: 'AI 개발' },
  {
    key: 'cs',
    label: 'CS 지식',
    children: [
      { key: 'algorithm', label: '알고리즘' },
      { key: 'data-structure', label: '자료구조' },
      { key: 'database', label: '데이터베이스' },
      { key: 'network', label: '네트워크' },
      { key: 'os', label: '운영체제' },
    ],
  },
  { key: 'projects', label: '프로젝트' },
  { key: 'career', label: '커리어' },
];

function flatten(nodes: TaxonomyNode[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const node of nodes) {
    out[node.key] = node.label;
    if (node.children) Object.assign(out, flatten(node.children));
  }
  return out;
}

export const CATEGORY_LABEL = flatten(TAXONOMY);
