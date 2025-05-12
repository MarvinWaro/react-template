<?php

namespace Database\Seeders;

use App\Models\Module;
use App\Models\ModulePermission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::withTrashed()->firstOrCreate(
            [
                'name' => 'Admin2',
                'description' => 'Role for admins',
                'for_admin' => true,
            ]
        );

        if ($role->trashed()) {
            $role->restore();
        }

        $modules = Module::all();

        foreach ($modules as $module) {
            $modulePermission = ModulePermission::withTrashed()->firstOrCreate([
                'role_id' => $role->id,
                'module_id' => $module->id,
                'name' => 'can_view',
            ]);

            if ($modulePermission->trashed()) {
                $modulePermission->restore();
            }
        }
    }
}
