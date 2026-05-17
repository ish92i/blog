'use client';

import { remark } from 'remark';
import html from 'remark-html';
import { useMemo } from 'react';

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  const htmlContent = useMemo(() => {
    return remark().use(html).processSync(content).toString();
  }, [content]);

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}