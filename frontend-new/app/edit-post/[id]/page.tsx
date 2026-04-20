'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UPDATE_POST } from '@/graphql/mutations';
import { GET_POST_BY_ID, GET_USER_POSTS } from '@/graphql/queries';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const postId = params.id as string;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  
  // Updated query - now using $id directly instead of input object
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_POST_BY_ID, {
    variables: { id: postId },
    skip: !postId,
  });

  const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST, {
    refetchQueries: [
      { query: GET_USER_POSTS, variables: { first: 10, page: 1 } },
      { query: GET_POST_BY_ID, variables: { id: postId } }
    ],
    onCompleted: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  // Load post data when available
  useEffect(() => {
    if (data?.GetPostById) {
      setTitle(data.GetPostById.title);
      setContent(data.GetPostById.content);
      setCurrentImage(data.GetPostById.image);
    }
  }, [data]);

  // Check authorization
  useEffect(() => {
    if (data?.GetPostById && user && data.GetPostById.user_id !== user.id) {
      setError('You are not authorized to edit this post');
    }
  }, [data, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (data?.GetPostById && data.GetPostById.user_id !== user.id) {
      setError('You are not authorized to edit this post');
      return;
    }

    try {
      const input: any = {
        id: postId,
        title,
        content,
      };

      if (image) {
        input.image = image;
      }

      await updatePost({
        variables: { input },
      });
    } catch (err: any) {
      console.error('Update post error:', err);
      setError(err.message || 'Failed to update post');
    }
  };

  if (authLoading || queryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (queryError) {
    console.error('Query error:', queryError);
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading post:</p>
          <p>{queryError.message}</p>
        </div>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!data?.GetPostById) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Post not found
        </div>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Edit Post</h2>
      
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
        
        {currentImage && !preview && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Current Image
            </label>
            <div className="relative h-32 w-32">
              <img 
                src={`http://localhost:8000${currentImage}`} 
                alt="Current" 
                className="h-32 w-32 object-cover rounded border border-gray-300"
              />
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Change Image (Optional)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
              <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded border border-gray-300" />
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateLoading}
            className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateLoading ? 'Updating...' : 'Update Post'}
          </button>
          
          <Link
            href="/dashboard"
            className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}