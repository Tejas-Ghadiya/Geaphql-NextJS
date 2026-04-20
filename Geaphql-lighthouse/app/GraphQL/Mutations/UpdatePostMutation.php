<?php 
declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Post;
use Illuminate\Support\Facades\Storage;

final readonly class UpdatePostMutation
{
    public function __invoke($_, array $args)
    {
        $post = Post::find($args['input']['id']);

        if (!$post) {
            return null;
        }

        // Update basic fields
        $post->title = $args['input']['title'];
        $post->content = $args['input']['content'];

        // Handle image upload
        if (isset($args['input']['image'])) {
            
            // Delete old image if it exists
            if ($post->image) {
                // Extract the relative path from stored value
                $oldImagePath = $post->image;
                
                // Remove /storage/ prefix if it exists
                if (str_starts_with($oldImagePath, '/storage/')) {
                    $oldImagePath = substr($oldImagePath, 9);
                }
                
                // Check if file exists and delete it
                if (Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }
            
            // Store new image
            $newPath = $imagePath = Storage::url( $args['input']['image']->store('posts', 'public') );
            
            $post->image = $newPath; // Store relative path only
        }

        $post->save();

        return $post;
    }
}