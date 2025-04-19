<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user()->hasAdminRole();
        if (!$user) {
            return redirect()->route('client.profile.edit');
        }

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => !$request->user()->hasVerifiedEmail(),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $id = auth()->id();
        
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'new_avatar' => 'nullable|image|max:2048',
            'remove_avatar' => 'required|boolean',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
        ]);

        $user = User::findOrFail($id);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
        ];
  
        if ($request->hasFile('new_avatar')) {
            if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
                \Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $request->file('new_avatar')->store('avatars', 'public');
            $updateData['avatar'] = $avatarPath;
        }

        if ($request->boolean('remove_avatar')) {
            if ($user->avatar && \Storage::disk('public')->exists($user->avatar)) {
                \Storage::disk('public')->delete($user->avatar);
            }
            $updateData['avatar'] = null;
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}