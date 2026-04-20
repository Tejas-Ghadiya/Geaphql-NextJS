'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_POST } from '@/graphql/mutations';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  
  const [createPost, { loading }] = useMutation(CREATE_POST);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
    try {
      const { data } = await createPost({
        variables: {
          input: {
            user_id: user.id,
            title,
            content,
            image,
          },
        },
      });
      
      if (data?.CreatePost) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Image
          </label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}