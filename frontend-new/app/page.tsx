'use client';

import { useQuery } from '@apollo/client';
import { GET_POSTS } from '@/graphql/queries';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 9; // Number of posts per page
  
  const { data, loading, error } = useQuery(GET_POSTS, {
    variables: { 
      first: itemsPerPage,  // Required: number of items per page
      page: page            // Optional: current page number
    },
  });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-gray-600">Loading posts...</div>
    </div>
  );
  
  if (error) return (
    <div className="text-red-600 text-center p-4">
      Error: {error.message}
    </div>
  );

  const posts = data?.posts?.data || [];
  const paginatorInfo = data?.posts?.paginatorInfo;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Posts</h1>
      
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No posts available yet.
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                {post.image && (
                  <div className="relative h-48">
                    <img
                      src={`http://localhost:8000${post.image}`} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                  <Link
                    href={`/post/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {paginatorInfo && paginatorInfo.lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-8">
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