import { BlogCard } from "./BlogCard";

interface Post {
  title: string;
  excerpt: string;
  date: string;
  coverImage?: string;
  slug: string;
}

interface BlogListProps {
  posts: Post[];
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} {...post} />
      ))}
    </div>
  );
}