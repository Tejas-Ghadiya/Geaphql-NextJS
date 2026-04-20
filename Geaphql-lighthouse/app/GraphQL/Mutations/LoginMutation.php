<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final readonly class LoginMutation
{
    /** @param  array{}  $args */
    public function __invoke(null $_, array $args)
    {
        $crediyantiyal = [
            'email' => $args['input']['email'],
            'password' => $args['input']['password']
        ];
        if(!auth()->attempt($crediyantiyal)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials']
            ]);
        }
        $user = User::where('email', $args['input']['email'])->first();
        if($user){
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ];
        }
        return ['message' => 'Login failed'];
    }
}
