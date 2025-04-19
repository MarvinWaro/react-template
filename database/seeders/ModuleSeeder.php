<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['name' => 'Dashboard', 'description' => 'Welcome to your dashboard'],
            ['name' => 'Programs', 'description' => null],
            ['name' => 'Users', 'description' => 'Manage the users of this system'],
            ['name' => 'Roles', 'description' => 'Manage the roles and permissions for your users'],
            ['name' => 'Modules', 'description' => 'Manage the modules of the system.'],
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
