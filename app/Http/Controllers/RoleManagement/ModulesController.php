<?php

namespace App\Http\Controllers\RoleManagement;

use App\Models\Role;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Controller;
use App\Attributes\RoleAccess;
use App\Models\ModulePermission;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ModulesController extends Controller
{
    #[RoleAccess('Modules', 'can_view')]
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $page = (int) $request->get("page", 1);
        $search = $request->query('search');
        $sortBy = $request->query('sortBy');
        $sortDirection = $request->query('sortDirection');

        $defaultSortBy = 'order';
        $defaultSortDirection = 'asc';
        $sortFields = ['id', 'order', 'icon', 'name', 'description', 'path', 'is_client', 'group_title', 'created_at'];
        $perPagesDropdown = [5, 10, 25, 50, 100];

        $perPage = (int) $request->query('perPage', $perPagesDropdown[0]);

        if (!in_array($perPage, $perPagesDropdown)) {
            $perPage = array_key_first($perPagesDropdown);
        }

        $query = Module::with(['roles.users', 'parent']);

        if ($search) {
            $term = ltrim($search, '!');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if (in_array($sortBy, $sortFields) && in_array($sortDirection, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy($defaultSortBy, $defaultSortDirection);
        }

        $modules = $query->paginate($perPage)->withQueryString();

        $modules->getCollection()->transform(function ($module) {
            $module->users = $module->roles->flatMap->users->unique('id')->values();
            $module->parent_name = $module->parent?->name;
            return $module;
        });

        if ($page > $modules->lastPage()) {
            return redirect()->route('modules', array_merge(
                $request->except(keys: 'page'),
                ['page' => 1]
            ));
        }

        $allModulesCount = Module::count();

        $context = [
            'modules' => $modules,
            'tableData' => [
                'search' => $search,
                'filters' => explode(',', $filters ?? ''),
                'sort' => $sortBy,
                'direction' => $sortDirection,
                'page' => $page,
                'perPage' => $perPage,
                'perPagesDropdown' => $perPagesDropdown,
            ],
            'allModulesCount' => $allModulesCount
        ];

        return Inertia::render('role-management/modules', $context);
    }

    #[RoleAccess('Modules', 'can_update')]
    public function viewManageModule(Request $request): InertiaResponse
    {
        $moduleId = $request->route('id');

        $module = Module::with('roles')->find($moduleId);

        $roles = Role::orderBy('name')->get();

        $modules = Module::whereNull('parent_id')
            ->orderBy('name')
            ->select('id', 'name')
            ->get();

        $context = [
            'module' => $module,
            'modules' => $modules,
            'roles' => $roles
        ];

        return Inertia::render('role-management/manage-module', $context);
    }

    #[RoleAccess('Modules', 'can_update')]
    public function updateModulePermissions(Request $request): RedirectResponse
    {
        $moduleId = $request->moduleId;

        $request->validate([
            'icon' => [
                'string',
                'max:255',
            ],
            'order' => [
                'required',
                'integer',
                'min:0',
                Rule::unique('modules')->ignore($moduleId),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('modules')->ignore($moduleId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
            'parent_id' => [
                'nullable',
                'string',
                Rule::exists('modules', 'id')->where(function ($query) use ($moduleId) {
                    return $query->where('id', '!=', $moduleId);
                }),
            ],
            'path' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('modules')->ignore($moduleId),
            ],
            'is_client' => [
                'nullable',
                'boolean',
            ],
            'group_title' => [
                'nullable',
                'string',
                'max:255',
            ],
            'available_actions' => [
                'array',
            ],
        ]);

        $rolesId = $request->rolesId ?? [];

        $moduleIcon = $request->icon;
        $moduleOrder = $request->order;
        $moduleParentId = $request->parent_id;
        $modulePath = $request->path;
        $moduleIsClient = $request->is_client;
        $moduleGroupTitle = $request->group_title;
        $moduleName = $request->name;
        $moduleDescription = $request->description;
        $moduleAvailableActions = $request->available_actions;

        DB::transaction(function () use ($moduleId, $rolesId, $moduleIcon, $moduleOrder, $moduleParentId, $modulePath, $moduleIsClient, $moduleGroupTitle, $moduleName, $moduleDescription, $moduleAvailableActions) {
            foreach ($rolesId as $roleId) {
                $existing = ModulePermission::withTrashed()
                    ->where('role_id', $roleId)
                    ->where('module_id', $moduleId)
                    ->where('name', 'can_view')
                    ->first();

                if ($existing) {
                    $existing->restore();
                } else {
                    ModulePermission::create([
                        'role_id' => $roleId,
                        'module_id' => $moduleId,
                        'name' => 'can_view'
                    ]);
                }
            }

            ModulePermission::where('module_id', $moduleId)
                ->whereNotIn('role_id', $rolesId)
                ->whereNull('deleted_at')
                ->where('name', 'can_view')
                ->delete();

            ModulePermission::where('module_id', $moduleId)
                ->whereNotIn('name', $moduleAvailableActions)
                ->whereNull('deleted_at')
                ->delete();

            Module::where('id', $moduleId)
                ->update([
                    'icon' => $moduleIcon,
                    'order' => $moduleOrder,
                    'parent_id' => $moduleParentId,
                    'path' => $modulePath,
                    'is_client' => $moduleIsClient,
                    'group_title' => $moduleGroupTitle,
                    'name' => $moduleName,
                    'description' => $moduleDescription,
                    'available_actions' => $moduleAvailableActions,
                ]);
        });

        return redirect()->back()->with('success', 'Module updated successfully.');
    }

    #[RoleAccess('Modules', 'can_create')]
    public function createModule(Request $request): RedirectResponse
    {
        $request->validate([
            'icon' => [
                'nullable',
                'string',
                'max:255',
            ],
            'order' => [
                'required',
                'integer',
                'min:0',
                'unique:' . Module::class
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:' . Module::class
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
            'path' => [
                'nullable',
                'string',
                'max:255',
                'unique:' . Module::class
            ],
            'group_title' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $moduleIcon = $request->icon;
        $moduleOrder = $request->order;
        $modulePath = $request->path;
        $moduleGroupTitle = $request->group_title;
        $moduleName = $request->name;
        $moduleDescription = $request->description;

        $module = Module::create([
            'icon' => $moduleIcon,
            'order' => $moduleOrder,
            'path' => $modulePath ?? null,
            'group_title' => $moduleGroupTitle,
            'name' => $moduleName,
            'description' => $moduleDescription,
            'available_actions' => ["can_view"],
        ]);

        return redirect()->route('modules.view', $module->id)
            ->with('success', 'User created successfully.');
    }

    #[RoleAccess('Modules', 'can_delete')]
    public function delete(Request $request): RedirectResponse
    {
        $moduleId = $request->route('id');

        $module = Module::find($moduleId);
        $module->delete();

        return redirect()->back();
    }
}
