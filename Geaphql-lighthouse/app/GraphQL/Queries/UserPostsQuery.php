<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;

final readonly class UserPostsQuery
{
    /** @param  array{}  $args */
public function __invoke($_, array $args)
{
    $user = auth()->id();

    if (!$user) {
        throw new \Exception('Unauthenticated');
    }

    return Post::where('user_id', $user)
        ->paginate(
            $args['first'] ?? 10,
            ['*'],
            'page',
            $args['page'] ?? 1
        );
}
}