<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            [
                'group_title' => 'Platform',
                'icon' => 'LayoutGrid',
                'order' => 1,
                'path' => '/dashboard',
                'name' => 'Dashboard',
                'description' => 'Welcome to your dashboard',
                'available_actions' => ['can_view'],
            ],
            [
                'group_title' => 'Platform',
                'icon' => 'Pi',
                'order' => 2,
                'path' => null,
                'name' => 'Programs',
                'description' => null,
                'available_actions' => ['can_view'],
            ],
            [
                'group_title' => 'Platform',
                'icon' => 'Pi',
                'order' => 3,
                'path' => null,
                'name' => 'Programs 1',
                'description' => null,
                'available_actions' => ['can_view'],
            ],
            [
                'group_title' => 'Role Management',
                'icon' => 'UsersRound',
                'order' => 4,
                'path' => '/users',
                'name' => 'Users',
                'description' => 'Manage the users of this system',
                'available_actions' => ['can_view', 'can_create', 'can_update', 'can_delete'],
            ],
            [
                'group_title' => 'Role Management',
                'icon' => 'UserRoundCog',
                'order' => 5,
                'path' => '/roles',
                'name' => 'Roles',
                'description' => 'Manage the roles and permissions for your users',
                'available_actions' => ['can_view', 'can_create', 'can_update', 'can_delete'],
            ],
            [
                'group_title' => 'Role Management',
                'icon' => 'SquareDashedMousePointer',
                'order' => 6,
                'path' => '/modules',
                'name' => 'Modules',
                'description' => 'Manage the modules of the system.',
                'available_actions' => ['can_view', 'can_create', 'can_update', 'can_delete'],
            ],
        ];

        foreach ($modules as $data) {
            $module = Module::withTrashed()->firstOrCreate(
                ['name' => $data['name']],
                [
                    'description' => $data['description'],
                    'order' => $data['order'],
                    'path' => $data['path'],
                    'available_actions' => $data['available_actions'],
                    'icon' => $data['icon'],
                    'group_title' => $data['group_title'],
                ]
            );

            if ($module->trashed()) {
                $module->restore();
            }
        }
    }
}
