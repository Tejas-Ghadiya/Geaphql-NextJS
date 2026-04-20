<?php

namespace App\GraphQL\Queries;

use App\Models\Post;

class GetPostByIdQuery
{
    public function __invoke($_, array $args)
    {
        $postId = $args['input']['id'] ?? null;
        
        if (!$postId) {
            throw new \Exception('Post ID is required');
        }
        
        $post = Post::find($postId);
        
        if (!$post) {
            return null;
        }
        
        return $post;
    }
}