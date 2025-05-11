<?php

namespace App\Http\Controllers\RoleManagement;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RoleUser;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Attributes\RoleAccess;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    #[RoleAccess('Users')]
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $page = (int) $request->get("page", 1);
        $search = $request->query('search');
        $filters = $request->query('filters');
        $sortBy = $request->query('sortBy');
        $sortDirection = $request->query('sortDirection');

        $sortFields = ['id', 'name', 'email', 'activated_at'];
        $perPagesDropdown = [5, 10, 25, 50, 100];

        $perPage = (int) $request->query('perPage', $perPagesDropdown[0]);

        if (!in_array($perPage, $perPagesDropdown)) {
            $perPage = array_key_first($perPagesDropdown);
        }

        $filterValues = array_filter(explode(',', $filters ?? ''));

        $filterMap = [
            'verified' => fn($query) => $query->whereNotNull('email_verified_at'),
            'active' => fn($query) => $query->whereNotNull('activated_at'),
        ];

        $query = User::query();

        foreach ($filterValues as $filter) {
            if (array_key_exists($filter, $filterMap)) {
                $filterMap[$filter]($query);
            }
        }

        if ($search) {
            $term = ltrim($search, '!');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            });
        }

        if (in_array($sortBy, $sortFields) && in_array($sortDirection, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $allUsers = $query->paginate($perPage)->withQueryString();

        if ($page > $allUsers->lastPage()) {
            return redirect()->route('users', array_merge(
                $request->except(keys: 'page'),
                ['page' => 1]
            ));
        }

        $allUsersCount = User::count();

        $context = [
            'users' => $allUsers,
            'tableData' => [
                'search' => $search,
                'filters' => explode(',', $filters ?? ''),
                'sort' => $sortBy,
                'direction' => $sortDirection,
                'page' => $page,
                'perPage' => $perPage,
                'perPagesDropdown' => $perPagesDropdown,
            ],
            'allUsersCount' => $allUsersCount
        ];

        return Inertia::render('role-management/users', $context);
    }

    #[RoleAccess('Users')]
    public function createUser(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:' . User::class,
            'avatar' => 'nullable|image|max:2048',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        } else {
            $avatarPath = null;
        }

        $user = User::create([
            'name' => $request->name,
            'avatar' => $avatarPath,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        return redirect()->back();
    }

    #[RoleAccess('Users')]
    public function viewUser(Request $request): Response|RedirectResponse
    {
        $id = $request->route('id');
        $user = User::with('roles')->findOrFail($id);

        $roles = Role::all();

        $context = [
            'user' => $user,
            'roles' => $roles,
        ];

        return Inertia::render('role-management/view-user', $context);
    }

    #[RoleAccess('Users')]
    public function deleteUser(Request $request): RedirectResponse
    {
        $id = $request->route('id');

        $currentUser = Auth::user();

        if ($currentUser->id === (int) $id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back();
    }

    #[RoleAccess('Users')]
    public function updateUser(Request $request): RedirectResponse
    {
        $id = $request->route('id');

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
            'new_avatar' => 'nullable|image|max:2048',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($id),
            ],
        ]);

        DB::transaction(function () use ($request, $id) {
            $user = User::findOrFail($id);

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->hasFile('new_avatar')) {
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }

                $avatarPath = $request->file('new_avatar')->store('avatars', 'public');
                $updateData['avatar'] = $avatarPath;
            }

            $user->update($updateData);

            $rolesId = $request->rolesId ?? [];

            foreach ($rolesId as $roleId) {
                $existing = RoleUser::withTrashed()
                    ->where('user_id', $id)
                    ->where('role_id', $roleId)
                    ->first();

                if ($existing) {
                    $existing->restore();
                } else {
                    RoleUser::create([
                        'user_id' => $id,
                        'role_id' => $roleId,
                    ]);
                }
            }

            RoleUser::where('user_id', $id)
                ->whereNotIn('role_id', $rolesId)
                ->whereNull('deleted_at')
                ->delete();
        });

        return redirect()->back()->with('success', 'User updated successfully.');
    }
}
