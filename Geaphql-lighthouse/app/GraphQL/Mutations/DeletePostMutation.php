<?php
declare(strict_types=1);
namespace App\GraphQL\Mutations;

use App\Models\Post;
use Illuminate\Support\Facades\Storage;

final readonly class DeletePostMutation
{
    public function __invoke($_, array $args)
    {
        $post = Post::find($args['input']['id']);

        if (!$post) {
            return false;
        }
        if ($post->user_id !== auth()->id()) {
            throw new \Exception('Unauthorized');
        }
        if ($post->image) {
            $path = str_replace('/storage/', '', $post->image);
            Storage::disk('public')->delete($path);
        }
        $post->delete();

        return true;
    }
}