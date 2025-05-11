import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type Role = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    for_admin: boolean;
    permissions: Record<string, string[]>;
};

interface Module {
    id: string;
    name: string;
    icon: string;
    path: string;
    order: number;
    is_client: boolean;
    description: string;
    created_at: string;
    updated_at: string;

    available_actions: string[];
    children?: Module[];
}

interface RolePermissionsProps {
    role: Role;
    modules: Module[];
}

type ManageRoleForm = {
    name: string;
    description: string;
    for_admin: boolean;
    roleId: string;
    permissions: Record<string, string[]>;
};

export default function RolePermissions({ role, modules }: RolePermissionsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: role.name,
            href: `/roles/view/${role.id}`,
        },
    ];

    const handleToggle = (moduleId: string, action: string, checked: boolean) => {
        setData((prev) => {
            const current = prev.permissions[moduleId] || [];
            const updated = checked ? Array.from(new Set([...current, action])) : current.filter((a) => a !== action);

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [moduleId]: updated,
                },
            };
        });
    };

    const defaultPermissions: Record<string, string[]> = role.permissions ?? {};

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<ManageRoleForm>({
        name: role.name,
        description: role.description,
        for_admin: role.for_admin,
        roleId: role.id,
        permissions: defaultPermissions,
    });

    const handleSubmit = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('roles.update-permissions'), {
                preserveScroll: true,
                onSuccess: () => {
                    resolve();
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating role permissions...',
            success: 'Role permissions updated successfully!',
            error: 'Failed to update role permissions!',
            duration: 5000,
        });
    };

    // TODO: delete module_permissions if data.for_admin is false.
    // TODO: update manage modules.
    // TODO: integrate the module routes to client side.
    // TODO: integrate unpic images to avatars.

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${role.name} Role`} />
            <div className="px-4 py-6">
                <div className="mb-8 flex flex-col space-y-0.5">
                    <input
                        type="text"
                        className="text-xl font-semibold tracking-tight focus:outline-none"
                        defaultValue={role.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Role Name"
                    />

                    <input
                        type="text"
                        className="text-muted-foreground text-sm focus:outline-none"
                        defaultValue={role.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Description"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <div className="mb-4 flex w-max items-center gap-2 border-b pb-2 text-sm font-medium">
                        <Checkbox
                            id="for-admin"
                            checked={data.for_admin ? true : false}
                            onCheckedChange={(checked) => {
                                const isChecked = !!checked;
                                setData('for_admin', isChecked);
                            }}
                        />
                        <label
                            htmlFor="for-admin"
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Can access admin dashboard
                        </label>
                    </div>
                    {data.for_admin ? (
                        modules.map((module) => {
                            const renderModule = (mod: Module, indentLevel = 0) => {
                                const actions = mod.available_actions ?? [];
                                const modulePermissions = data.permissions[mod.id] ?? [];
                                const indentStyle = indentLevel > 0 ? { marginLeft: `${indentLevel * 1.5}rem`, marginTop: '10px' } : {};

                                return (
                                    <div key={mod.id} className={`mb-4 ${indentLevel == 0 && 'border-b'} pb-2`} style={indentStyle}>
                                        <p className="mb-2 text-sm font-semibold">{mod.name}</p>
                                        <div className="flex flex-wrap gap-4">
                                            {actions.map((action) => {
                                                const checkboxId = `${mod.id}-${action}`;
                                                const isChecked = modulePermissions.includes(action);

                                                return (
                                                    <div key={checkboxId} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={checkboxId}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                handleToggle(mod.id, action, !!checked);
                                                            }}
                                                            disabled={!data.for_admin}
                                                        />
                                                        <label htmlFor={checkboxId} className="text-sm font-medium">
                                                            {action.replace('can_', '').replace('_', ' ').toUpperCase()}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {mod.children
                                            ? mod.children?.length > 0 && mod.children.map((child) => renderModule(child, indentLevel + 1))
                                            : null}
                                    </div>
                                );
                            };

                            return renderModule(module);
                        })
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-gray-500">This role is not allowed to access the admin dashboard.</p>
                        </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                        <Button
                            type="button"
                            className="rounded bg-black px-4 py-1 text-white hover:bg-gray-800"
                            onClick={handleSubmit}
                            disabled={processing}
                        >
                            Save Changes
                        </Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                    {errors.name && <span className="text-sm font-medium text-red-500">{errors.name}</span>}
                </div>
            </div>
        </AppLayout>
    );
}
