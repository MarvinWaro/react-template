import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CornerDownRight } from 'lucide-react';
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

    const { auth } = usePage<SharedData>().props;
    const currentUserRoles = auth.user.roles;

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
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }
                },
                onError: () => {
                    reject('Failed to update role permissions.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating role permissions...',
            success: 'Role permissions updated successfully!',
            error: (message) => message,
            duration: 5000,
            description: formatDateFull(new Date()),
            descriptionClassName: '!text-gray-500',
            classNames: {
                success: '!text-green-700',
                error: '!text-red-700',
                loading: '!text-blue-700',
            },
        });
    };

    // TODO: integrate the module routes to client side.
    // TODO: integrate unpic images to avatars.

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${role.name} Role`} />
            <div className="px-4 py-6">
                <Heading title={data.name} description={data.description} />
                <div className="flex flex-col">
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Name</span>
                            <span className="text-muted-foreground text-xs">
                                The name of the role. This will be displayed in the admin dashboard.
                            </span>
                            <InputError message={errors.name} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none"
                                defaultValue={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Name"
                                name="name"
                                autoComplete="name"
                            />
                        </div>
                    </div>
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Description</span>
                            <span className="text-muted-foreground text-xs">
                                The description of the role. This will be displayed in the admin dashboard.
                            </span>
                            <InputError message={errors.description} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none"
                                defaultValue={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Description"
                                name="description"
                                autoComplete="description"
                            />
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-y text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Admin Access</span>
                            <span className="text-muted-foreground text-xs">
                                Determines if the role can access the admin dashboard. If enabled, the role will have access to all modules and
                                actions.
                            </span>
                            <InputError message={errors.description} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Switch
                                id="for-admin"
                                checked={data.for_admin ? true : false}
                                onCheckedChange={(checked) => {
                                    const isChecked = !!checked;
                                    setData('for_admin', isChecked);
                                }}
                            />
                        </div>
                    </div>
                    <span className="py-2 font-semibold">Module Permissions</span>
                    {data.for_admin ? (
                        modules.map((module, index) => {
                            const renderModule = (mod: Module, indentLevel = 0) => {
                                const actions = mod.available_actions ?? [];
                                const modulePermissions = data.permissions[mod.id] ?? [];
                                const indentStyle = indentLevel > 0 ? { marginLeft: `${indentLevel * 1}rem` } : {};

                                return (
                                    <div
                                        className={`flex items-stretch gap-3 ${index == modules.length - 1 ? 'border-y' : 'border-t'} text-sm font-medium`}
                                        key={mod.id}
                                    >
                                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                                            <span style={indentStyle} className="flex items-center gap-2">
                                                {indentLevel > 0 && <CornerDownRight size={16} />}
                                                {mod.name}
                                            </span>
                                            <span className="text-muted-foreground text-xs">{mod.description}</span>
                                        </div>
                                        <div className="my-auto flex gap-5 py-3">
                                            {actions.map((action) => {
                                                const checkboxId = `${mod.id}-${action}`;
                                                const isChecked = modulePermissions.includes(action);

                                                return (
                                                    <div key={checkboxId} className="flex items-center gap-2">
                                                        <Switch
                                                            id={checkboxId}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                handleToggle(mod.id, action, !!checked);
                                                            }}
                                                            disabled={
                                                                !data.for_admin ||
                                                                (action === 'can_view' &&
                                                                    auth.permissions?.[mod.name]?.can_view !== 1 &&
                                                                    currentUserRoles.some((r) => r.id === role.id))
                                                            }
                                                        />
                                                        <label htmlFor={checkboxId} className="text-sm font-medium">
                                                            {action.replace('can_', '').replace('_', ' ').toUpperCase()}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            };

                            if (module.children && module.children.length > 0) {
                                return (
                                    <div key={module.id}>
                                        {renderModule(module)}
                                        {module.children.map((child) => renderModule(child, 1))}
                                    </div>
                                );
                            }

                            return renderModule(module);
                        })
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-gray-500">This role is not allowed to access the admin dashboard.</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-3">
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
