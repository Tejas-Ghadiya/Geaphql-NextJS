'use client';

import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_POSTS } from '@/graphql/queries';
import { DELETE_POST } from '@/graphql/mutations';
import Link from 'next/link';
import { Trash2, Edit } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 5; // Number of items to load per scroll
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_USER_POSTS, {
    variables: { 
      first: itemsPerPage,
      page: 1
    },
    skip: !user,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const [deletePost] = useMutation(DELETE_POST, {
    onCompleted: () => {
      refetch();
      setAllPosts([]);
      setCurrentPage(1);
      setHasMore(true);
    },
  });

  // Update posts when data changes
  useEffect(() => {
    if (data?.UserPosts?.data) {
      if (currentPage === 1) {
        setAllPosts(data.UserPosts.data);
      } else {
        setAllPosts(prev => [...prev, ...data.UserPosts.data]);
      }
      setHasMore(data.UserPosts.paginatorInfo?.currentPage < data.UserPosts.paginatorInfo?.lastPage);
    }
  }, [data, currentPage]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && !loading) {
      loadMorePosts();
    }
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => observer.disconnect();
  }, [handleObserver]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const result = await fetchMore({
        variables: {
          first: itemsPerPage,
          page: nextPage
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            UserPosts: {
              ...fetchMoreResult.UserPosts,
              data: [...prev.UserPosts.data, ...fetchMoreResult.UserPosts.data]
            }
          };
        }
      });
      
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

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
          onClick={() => {
            setAllPosts([]);
            setCurrentPage(1);
            setHasMore(true);
            refetch();
          }}
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

      {loading && currentPage === 1 ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Loading posts...</div>
        </div>
      ) : allPosts.length === 0 ? (
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
                <thead className="bg-gray-50 sticky top-0">
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
                  {allPosts.map((post: any, index: number) => (
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

          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <div ref={loaderRef} className="text-center py-8">
              {loadingMore ? (
                <div className="flex justify-center items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading more posts...</span>
                </div>
              ) : (
                <div className="h-10"></div>
              )}
            </div>
          )}

          {/* End of posts message */}
          {!hasMore && allPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">You've reached the end! 🎉</p>
            </div>
          )}
          
          {/* Show total count */}
          {paginatorInfo && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {allPosts.length} of {paginatorInfo.total} posts
            </div>
          )}
        </>
      )}
    </div>
  );
}