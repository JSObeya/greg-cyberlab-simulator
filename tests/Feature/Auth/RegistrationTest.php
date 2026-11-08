<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register_and_are_pending_admin_approval(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test Cadet',
            'email' => 'cadet@example.com',
            'phone' => '+234 803 111 2233',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');

        $this->assertDatabaseHas('users', [
            'email' => 'cadet@example.com',
            'is_active' => false,
        ]);
    }
}
