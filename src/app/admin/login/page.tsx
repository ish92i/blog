'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin-token', data.token);
        router.push('/admin');
      } else {
        setError('Mot de passe invalide');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
      <Card className="w-full max-w-sm bg-white border-zinc-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-zinc-900">Connexion Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500"
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-zinc-900 text-white hover:bg-zinc-800 font-medium"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}