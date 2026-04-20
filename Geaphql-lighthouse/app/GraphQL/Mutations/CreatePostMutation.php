<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;

final readonly class CreatePostMutation
{
    /** @param  array{}  $args */
    public function __invoke(null $_, array $args)
    {
        $imagePath = null;
        if (isset($args['input']['image'])) {
            $imagePath = Storage::url(
                $args['input']['image']->store('posts', 'public')
            );
        }

        $post = new Post();
        $post->user_id = $args['input']['user_id'];
        $post->title = $args['input']['title'];
        $post->content = $args['input']['content'];
        $post->image = $imagePath;
        $post->save();

        return $post;
    }
}
