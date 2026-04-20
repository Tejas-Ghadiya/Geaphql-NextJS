<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final readonly class RegisterMutation
{
    /** @param  array{}  $args */
    public function __invoke(null $_, array $args)
    {
        if($args['input']['password'] !== $args['input']['confirm_password']) {
            throw ValidationException::withMessages([
                'confirm_password' => ['Passwords do not match']
            ]);
        }
        $userExists = User::where('email', $args['input']['email'])->exists();
        if($userExists) {
            throw ValidationException::withMessages([
                'email' => ['Email already exists']
            ]);
        }
        $user = User::create([
            'name' => $args['input']['name'],
            'email' => $args['input']['email'],
            'password' => bcrypt($args['input']['password']),
        ]);
        if($user){
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ];
        }
    }
}
