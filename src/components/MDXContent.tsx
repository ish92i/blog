'use client';

import MDEditor from '@uiw/react-md-editor';

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  return (
    <div data-color-mode="light">
      <MDEditor.Markdown source={content} />
    </div>
  );
}