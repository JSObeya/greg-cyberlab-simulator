<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Programme;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $programmes = Programme::where('is_active', true)
            ->select('id', 'title', 'code')
            ->orderBy('title')
            ->get();

        return Inertia::render('Auth/Register', [
            'programmes' => $programmes,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'nullable|string|max:30',
            'programme_id' => 'nullable|exists:programmes,id',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => UserRole::TRAINEE,
            'is_active' => false, // Inactive pending admin approval
            'password' => Hash::make($request->password),
        ]);

        if ($request->filled('programme_id')) {
            $user->programmes()->attach($request->programme_id, [
                'enrolled_at' => now(),
                'status' => 'pending_approval',
            ]);
        }

        event(new Registered($user));

        return redirect()->route('login')->with(
            'status',
            'Registration submitted successfully! Your account is pending Administrator approval before activation. You will be able to log in once an administrator approves your profile.'
        );
    }
}
