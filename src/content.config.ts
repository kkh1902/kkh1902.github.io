import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['ai-dev', 'cs', 'projects', 'career']),
    subcategory: z
      .enum([
        'claude',
        'agent-engineering',
        'mcp-tools',
        'prompt-engineering',
        'algorithm',
        'data-structure',
        'database',
        'network',
        'os',
      ])
      .optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
