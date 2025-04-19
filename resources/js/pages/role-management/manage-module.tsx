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
    roles: {
        id: string;
    }[];
};

interface ManageModuleProps {
    module: Module;
    roles: Role[];
}

type ManageModuleForm = {
    name: string;
    description: string;
    moduleId: string;
    rolesId: string[];
};

export default function ManageModule({ module, roles }: ManageModuleProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Modules',
            href: '/modules',
        },
        {
            title: module.name,
            href: `/modules/view/${module.id}`,
        },
    ];

    const handleToggle = (roleId: string, checked: boolean) => {
        setData((prev) => {
            const updated = checked ? [...prev.rolesId, roleId] : prev.rolesId.filter((id) => id !== roleId);

            setSelectAll(updated.length === roles.length ? true : updated.length === 0 ? false : 'indeterminate');

            return { ...prev, rolesId: updated };
        });
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<Required<ManageModuleForm>>({
        name: module.name,
        description: module.description,
        moduleId: module.id,
        rolesId: module.roles.map((role) => role.id),
    });

    const selectableRoles = roles.filter((role) => role.for_admin).map((role) => role.id);

    const [selectAll, setSelectAll] = useState<boolean | 'indeterminate'>(
        data.rolesId.length === 0 ? false : data.rolesId.every((id) => selectableRoles.includes(id)) ? true : 'indeterminate',
    );

    const handleSubmit = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('modules.update-permissions'), {
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
            loading: 'Updating module permissions...',
            success: 'Module permissions updated successfully!',
            error: 'Failed to update module permissions!',
            duration: 5000,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${module.name} Module`} />
            <div className="px-4 py-6">
                <div className="mb-8 flex flex-col space-y-0.5">
                    <input
                        type="text"
                        className="text-xl font-semibold tracking-tight focus:outline-none"
                        defaultValue={module.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Role Name"
                    />

                    <input
                        type="text"
                        className="text-muted-foreground text-sm focus:outline-none"
                        defaultValue={module.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Description"
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex w-max items-center gap-2 border-b pb-2 text-sm font-medium">
                        <Checkbox
                            id="select-all-roles"
                            checked={selectAll}
                            onCheckedChange={(checked) => {
                                const isChecked = !!checked;

                                setSelectAll(isChecked);

                                const selectableRoles = roles.filter((role) => role.for_admin).map((role) => role.id);

                                setData('rolesId', isChecked ? selectableRoles : []);
                            }}
                        />
                        <label
                            htmlFor="select-all-roles"
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Select All
                        </label>
                    </div>
                    {roles.map((role) => (
                        <div key={role.id} className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox
                                id={role.id}
                                checked={data.rolesId.includes(role.id)}
                                onCheckedChange={(checked) => handleToggle(role.id, !!checked)}
                                disabled={!role.for_admin}
                            />
                            <label
                                htmlFor={role.id}
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {role.name}
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
