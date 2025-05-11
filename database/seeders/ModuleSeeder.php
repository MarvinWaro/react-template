<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['order' => 1, 'path' => null, 'name' => 'Dashboard', 'description' => 'Welcome to your dashboard', 'available_actions' => ['can_view']],
            ['order' => 2, 'path' => null, 'name' => 'Programs', 'description' => null, 'available_actions' => ['can_view']],
            ['order' => 2, 'path' => null, 'name' => 'Programs 1', 'description' => null, 'available_actions' => ['can_view']],
            ['order' => 3, 'path' => null, 'name' => 'Users', 'description' => 'Manage the users of this system', 'available_actions' => ['can_view']],
            ['order' => 4, 'path' => null, 'name' => 'Roles', 'description' => 'Manage the roles and permissions for your users', 'available_actions' => ['can_view']],
            ['order' => 5, 'path' => '/modules', 'name' => 'Modules', 'description' => 'Manage the modules of the system.', 'available_actions' => ['can_view']],
        ];

        foreach ($modules as $data) {
            $module = Module::withTrashed()->firstOrCreate(
                ['name' => $data['name']],
                ['description' => $data['description']]
            );

            if ($module->trashed()) {
                $module->restore();
            }
        }
    }
}
