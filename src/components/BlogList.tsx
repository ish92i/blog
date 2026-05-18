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
    <div className="grid gap-8 md:grid-cols-2">
      {posts.map((post) => (
        <BlogCard key={post.slug} {...post} />
      ))}
    </div>
  );
}
