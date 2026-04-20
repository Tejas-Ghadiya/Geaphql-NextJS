'use client';

import { useQuery } from '@apollo/client';
import { GET_POSTS } from '@/graphql/queries';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 2;
  
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: { 
      first: itemsPerPage,
      page: 1
    },
  });

  // Set initial posts
  useEffect(() => {
    if (data?.posts?.data) {
      console.log('Initial posts:', data.posts.data.length);
      setPosts(data.posts.data);
      const paginatorInfo = data.posts.paginatorInfo;
      setHasMore(paginatorInfo?.currentPage < paginatorInfo?.lastPage);
      setPage(1);
    }
  }, [data]);

  // Function to load more posts
  const loadMore = async () => {
    if (loadingMore || !hasMore) {
      console.log('Skipping load:', { loadingMore, hasMore });
      return;
    }

    const nextPage = page + 1;
    console.log('Loading page:', nextPage);
    setLoadingMore(true);

    try {
      const result = await fetchMore({
        variables: {
          first: itemsPerPage,
          page: nextPage
        },
      });

      if (result.data?.posts?.data) {
        const newPosts = result.data.posts.data;
        const paginatorInfo = result.data.posts.paginatorInfo;
        
        console.log('New posts:', newPosts.length);
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(paginatorInfo?.currentPage < paginatorInfo?.lastPage);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Simple scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore || loading) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        console.log('Scroll near bottom, loading more...');
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loading, page]); // Add page dependency

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Posts</h1>
      
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No posts available yet.
        </div>
      ) : (
        <>
          {/* Posts */}
          <div className="space-y-8">
            {posts.map((post: any) => (
              <article 
                key={post.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Post Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-red-600 rounded-full flex items-center justify-center">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">📷</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Author</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="relative bg-black">
                    <img
                      src={`http://localhost:8000${post.image}`} 
                      alt={post.title}
                      className="w-full object-contain max-h-[600px]"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex gap-4 mb-3">
                    <button className="text-gray-700 hover:text-red-600 transition">
                      ❤️
                    </button>
                    <button className="text-gray-700 hover:text-blue-600 transition">
                      💬
                    </button>
                    <button className="text-gray-700 hover:text-green-600 transition">
                      🔗
                    </button>
                  </div>

                  {/* Post Title */}
                  <div className="mb-2">
                    <span className="font-semibold mr-2">Author</span>
                    <span className="text-gray-800">{post.title}</span>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-600 text-sm mb-3">
                    {post.content.length > 150 
                      ? `${post.content.substring(0, 150)}...` 
                      : post.content}
                  </p>

                  {/* Read More Link */}
                  <Link
                    href={`/post/${post.id}`}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800"
                  >
                    View Comments →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Loading indicator */}
          <div className="text-center py-8">
            {loadingMore && (
              <div className="flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-gray-600">Loading more posts...</span>
              </div>
            )}
            {!loadingMore && hasMore && posts.length > 0 && (
              <div className="py-4 text-center">
                <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                  <span>⬇️</span>
                  <span>Scroll down to load more</span>
                  <span>⬇️</span>
                </div>
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">You're all caught up! 🎉</p>
              </div>
            )}
          </div>

          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center pb-8 text-xs text-gray-400">
              Page: {page} | Posts: {posts.length} | Has more: {hasMore ? 'Yes' : 'No'}
            </div>
          )}
        </>
      )}

      {/* Scroll to top button */}
      <ScrollToTopButton />
    </div>
  );
}

// Scroll to top button component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-200 z-50 hover:scale-110 transform"
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}