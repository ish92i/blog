# Blog Application Specification

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **UI**: Shadcn/UI + Tailwind CSS
- **ORM**: Drizzle ORM + Neon PostgreSQL
- **File Upload**: UploadThing
- **Content**: MDX with editor (CodeMirror/MDX)
- **Package Manager**: PNPM

## Pages

### `/` - Blog List
- Responsive grid of blog cards
- Each card: cover image, title, excerpt, date, author
- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns

### `/post/:id` - View Post
- Full blog post with MDX rendering
- Header image below title/subtitle
- Responsive typography
- Back navigation

### `/post/new` - Create Post
- MDX editor with live preview
- Cover image upload via UploadThing
- Title, subtitle, excerpt fields
- Publish button

### `/post/edit/:id` - Edit Post
- Same as create, pre-populated
- Save/Delete actions

## Data Model

### Post
```
- id: string (uuid)
- title: string
- subtitle: string (optional)
- excerpt: string
- content: text (MDX)
- coverImage: string (URL)
- createdAt: timestamp
- updatedAt: timestamp
- published: boolean
```

## Design System
- Minimalistic, clean aesthetic
- Monochromatic with subtle accent
- Focus on typography and whitespace
- Fully responsive (mobile-first)
- Dark/Light mode support via Shadcn

## API Routes
- `GET /api/posts` - List posts
- `GET /api/posts/[id]` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/upload` - UploadThing endpoint
