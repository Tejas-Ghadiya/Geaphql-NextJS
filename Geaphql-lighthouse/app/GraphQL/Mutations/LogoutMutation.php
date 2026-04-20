<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Auth;

final class LogoutMutation
{
    public function __invoke($_, array $args)
    {
        $user = Auth::user(); // or auth()->user()

        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        $user->currentAccessToken()->delete();

        return true;
    }
}