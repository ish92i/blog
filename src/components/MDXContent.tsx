'use client';

import { remark } from 'remark';
import html from 'remark-html';
import { useMemo } from 'react';

interface MDXContentProps {
  content: string;
}

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function MDXContent({ content }: MDXContentProps) {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    if (isHtml(content)) {
      return content;
    }
    return remark().use(html).processSync(content).toString();
  }, [content]);

  if (!content) {
    return <p className="text-muted-foreground">No content available.</p>;
  }

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}