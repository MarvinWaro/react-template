import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type Role = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    role_modules: {
        id: string;
        module_id: string;
    }[];
    for_admin: boolean;
};

type Module = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
};

interface RolePermissionsProps {
    role: Role;
    modules: Module[];
}

type ManageRoleForm = {
    name: string;
    description: string;
    for_admin: boolean;
    roleId: string;
    modulesId: string[];
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

    const handleToggle = (moduleId: string, checked: boolean) => {
        setData((prev) => {
            const updated = checked ? [...prev.modulesId, moduleId] : prev.modulesId.filter((id) => id !== moduleId);

            setSelectAll(updated.length === modules.length ? true : updated.length === 0 ? false : 'indeterminate');

            return { ...prev, modulesId: updated };
        });
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<Required<ManageRoleForm>>({
        name: role.name,
        description: role.description,
        for_admin: role.for_admin,
        roleId: role.id,
        modulesId: role.role_modules.map((m) => m.module_id),
    });

    const [selectAll, setSelectAll] = useState<boolean | 'indeterminate'>(
        data.modulesId.length === modules.length ? true : data.modulesId.length === 0 ? false : 'indeterminate',
    );

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
                    <div className="flex w-max items-center gap-2 border-b pb-2 text-sm font-medium">
                        <Checkbox
                            id="for-admin"
                            checked={data.for_admin ? true : false}
                            onCheckedChange={(checked) => {
                                const isChecked = !!checked;
                                setData('for_admin', isChecked);

                                if (isChecked) {
                                    const allIds = modules.map((m) => m.id);
                                    setData('modulesId', allIds);
                                    setSelectAll(true);
                                } else {
                                    setData('modulesId', []);
                                    setSelectAll(false);
                                }
                            }}
                        />
                        <label
                            htmlFor="for-admin"
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Can access admin dashboard
                        </label>
                    </div>
                    <div className="flex w-max items-center gap-2 border-b pb-2 text-sm font-medium">
                        <Checkbox
                            id="select-all-modules"
                            checked={selectAll}
                            onCheckedChange={(checked) => {
                                const isChecked = !!checked;

                                setSelectAll(isChecked);
                                setData('modulesId', isChecked ? modules.map((m) => m.id) : []);
                            }}
                            disabled={!data.for_admin}
                        />
                        <label
                            htmlFor="select-all-modules"
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Select All
                        </label>
                    </div>
                    {modules.map((module) => (
                        <div key={module.id} className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox
                                id={module.id}
                                checked={data.modulesId.includes(module.id)}
                                onCheckedChange={(checked) => handleToggle(module.id, !!checked)}
                                disabled={!data.for_admin}
                            />
                            <label
                                htmlFor={module.id}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {module.name}
                            </label>
                        </div>
                    ))}
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
