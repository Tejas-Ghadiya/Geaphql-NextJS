'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_POST_BY_GEST_USER } from '@/graphql/queries';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postId = params.id as string;
  const [imageError, setImageError] = useState(false);

  const { data, loading, error } = useQuery(GET_POST_BY_GEST_USER, {
    variables: { id: postId },
    skip: !postId,
  });

  const post = data?.GetPostsGestUser;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading post:</p>
          <p>{error.message}</p>
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Post not found
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.user_id === user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition duration-200"
      >
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      {/* Post Card */}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Post Image */}
        {post.image && !imageError && (
          <div className="relative w-full h-96 bg-gray-200">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {/* Post Content */}
        <div className="p-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <span>User ID: {post.user_id}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span>{new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </div>
            {post.updated_at !== post.created_at && (
              <div className="text-sm text-gray-500">
                Updated: {new Date(post.updated_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Action Buttons for Author */}
          {isAuthor && (
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <Link
                href={`/edit-post/${post.id}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                <Edit size={18} />
                Edit Post
              </Link>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this post?')) {
                    // You can implement delete functionality here
                    router.push('/dashboard');
                  }
                }}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200"
              >
                <Trash2 size={18} />
                Delete Post
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}