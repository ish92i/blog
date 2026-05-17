# WYSIWYG Editor Drawer Design

## Overview
Replace the markdown editor in the post creation form with a mobile-first WYSIWYG experience using a drawer component.

## User Experience

### Main Form
- Content field shows rendered preview (not raw markdown)
- "Edit in Full Editor" button opens the drawer
- Preview is scrollable and shows formatted content

### Drawer Editor
- Full-screen WYSIWYG editor (Notion/Word-like)
- Toolbar at top with formatting options
- Live formatted view while typing
- "Done" button saves and closes drawer
- Smooth slide-up animation on mobile

## Components

### Toolbar (top of drawer)
- Bold, Italic, Underline
- Headings: H1, H2, H3
- Lists: Bullet, Numbered
- Link, Code
- Horizontal scroll on mobile

### Editor Canvas
- Clean white writing surface
- Full-width, comfortable padding
- Scrollable content area
- Placeholder text when empty

### Drawer
- Uses shadcn/ui Drawer component
- Full height on mobile
- Desktop: ~80% height, centered
- Close on backdrop click or "Done"

## Acceptance Criteria
1. Form shows rendered content preview (not markdown)
2. "Edit" button opens drawer with WYSIWYG editor
3. Toolbar buttons format selected text
4. Changes reflect immediately in editor
5. "Done" saves content and closes drawer
6. Mobile-first: works well on small screens
7. Dark mode support for editor