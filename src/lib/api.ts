export interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

export async function getPosts(published?: boolean): Promise<Post[]> {
  const params = published !== undefined ? `?published=${published}` : '';
  const res = await fetch(`/api/posts${params}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function getPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Post not found');
    throw new Error('Failed to fetch post');
  }
  return res.json();
}

export async function createPost(data: Partial<Post>): Promise<Post> {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update post');
  return res.json();
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete post');
}