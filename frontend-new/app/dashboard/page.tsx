'use client';

import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_POSTS } from '@/graphql/queries';
import { DELETE_POST } from '@/graphql/mutations';
import Link from 'next/link';
import { Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  
  const { data, loading, error, refetch } = useQuery(GET_USER_POSTS, {
    variables: { 
      first: itemsPerPage,  // Required: number of items per page
      page: page            // Optional: current page number
    },
    skip: !user,
  });
  
  const [deletePost] = useMutation(DELETE_POST, {
    onCompleted: () => {
      refetch(); // Refetch posts after deletion
    },
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Please login to view your dashboard</p>
        <Link href="/login" className="text-blue-600 hover:text-blue-800">
          Go to Login
        </Link>
      </div>
    );
  }

  if (error) {
    console.error('GraphQL Error Details:', error);
    return (
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error loading posts:</p>
          <p>{error.message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost({
          variables: { input: { id } },
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const posts = data?.UserPosts?.data || [];
  const paginatorInfo = data?.UserPosts?.paginatorInfo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link
          href="/create-post"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Create New Post
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No posts yet.</p>
          <Link
            href="/create-post"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post: any) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {post.content}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {post.image && (
                          <img 
                            src={`http://localhost:8000${post.image}`} 
                            alt={post.title}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <Link
                            href={`/edit-post/${post.id}`}
                            className="text-indigo-600 hover:text-indigo-900 transition duration-200"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-900 transition duration-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {paginatorInfo && paginatorInfo.lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {paginatorInfo.lastPage}
              </span>
              <button
                onClick={() => setPage(p => Math.min(paginatorInfo.lastPage, p + 1))}
                disabled={page === paginatorInfo.lastPage}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}