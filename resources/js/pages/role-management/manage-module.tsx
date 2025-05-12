import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { permissionActions, usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { getLucideIcon } from '@/lib/get-lucide-icon';
import { cn } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
    icon: string;
    path: string | null;
    order: number;
    is_client: boolean;
    group_title: string;
    description: string;
    created_at: string;
    updated_at: string;
    parent_id: string | null;
    available_actions: string[];
    roles: {
        id: string;
    }[];
};

interface ManageModuleProps {
    module: Module;
    modules: Module[];
    roles: Role[];
}

type ManageModuleForm = {
    icon: string;
    order: number;
    name: string;
    description: string;
    parent_id: string | null;
    path: string | null;
    is_client: boolean;
    group_title: string;
    available_actions: string[];
    moduleId: string;
    rolesId: string[];
};

export default function ManageModule({ module, modules, roles }: ManageModuleProps) {
    const { canUpdate } = usePermissions();

    const { auth } = usePage<SharedData>().props;
    const currentUserRoles = auth.user.roles;

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

            return { ...prev, rolesId: updated };
        });
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<Required<ManageModuleForm>>({
        icon: module.icon,
        order: module.order,
        name: module.name,
        description: module.description,
        parent_id: module.parent_id ? module.parent_id : null,
        path: module.path,
        is_client: module.is_client,
        group_title: module.group_title,
        available_actions: module.available_actions,
        moduleId: module.id,
        rolesId: module.roles.map((role) => role.id),
    });

    const handleSubmit = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('modules.update-permissions'), {
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
                    reject('Failed to update module permissions');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating module permissions...',
            success: 'Module updated successfully!',
            error: (message) => message,
            description: formatDateFull(new Date()),
            descriptionClassName: '!text-gray-500',
            duration: 5000,
            classNames: {
                success: '!text-green-700',
                error: '!text-red-700',
                loading: '!text-blue-700',
            },
            position: 'bottom-right',
        });
    };

    const [openParentModule, setOpenParentModule] = useState(false);
    const [parentModuleValue, setParentModuleValue] = useState(data.parent_id ?? '');

    const [roleSearch, setRoleSearch] = useState('');

    const Icon = getLucideIcon(data.icon);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${module.name} Module`} />
            <div className="px-4 py-6">
                <Heading title={data.name} description={data.description} />

                <div className="flex flex-col">
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Name</span>
                            <span className="text-muted-foreground text-xs">
                                <span>Name of the module in the sidebar. This is used to display the name of the module in the sidebar.</span>
                            </span>
                            <InputError message={errors.icon} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                                defaultValue={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Name"
                                name="name"
                                autoComplete="name"
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                    </div>
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Description</span>
                            <span className="text-muted-foreground text-xs">
                                <span>Description of the module.</span>
                            </span>
                            <InputError message={errors.icon} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                                defaultValue={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Description"
                                name="description"
                                autoComplete="description"
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                    </div>
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Icon</span>
                            <span className="text-muted-foreground text-xs">
                                <span>Icon of the module in the sidebar. This is used to display the icon of the module in the sidebar.</span>
                                <a href="https://lucide.dev/icons/" className="ml-1" target="_blank" rel="noopener noreferrer">
                                    <span className="text-blue-500 underline">Click here</span>
                                </a>
                                <span className="ml-1">to see the available icons.</span>
                            </span>
                            <InputError message={errors.icon} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                                defaultValue={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="Icon"
                                name="icon"
                                autoComplete="icon"
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                        {Icon && (
                            <div className="my-auto flex h-8 w-12 items-center justify-center rounded border bg-gray-50">
                                <Icon size={16} />
                            </div>
                        )}
                    </div>

                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Order</span>
                            <span className="text-muted-foreground text-xs">Order of the module in the sidebar</span>
                            <InputError message={errors.order} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="number"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                                defaultValue={data.order}
                                onChange={(e) => setData('order', parseInt(e.target.value))}
                                placeholder="Order"
                                name="order"
                                autoComplete="order"
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Parent Module</span>
                            <span className="text-muted-foreground text-xs">
                                Parent module of the module in the sidebar. This is used to group the modules in the sidebar.
                            </span>
                            <InputError message={errors.parent_id} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Popover open={openParentModule} onOpenChange={setOpenParentModule}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openParentModule}
                                        className="w-[215px] justify-between rounded-sm disabled:opacity-100"
                                        disabled={!canUpdate('Modules')}
                                    >
                                        {parentModuleValue ? modules.find((m) => m.id === parentModuleValue)?.name : 'Select parent module...'}
                                        <ChevronsUpDown className="opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[215px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search framework..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No framework found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value=""
                                                    onSelect={() => {
                                                        setParentModuleValue('');
                                                        setData('parent_id', null);
                                                        setOpenParentModule(false);
                                                    }}
                                                >
                                                    <span className="text-sm font-medium text-red-700">No Parent Module</span>
                                                    <Check className={cn('ml-auto', parentModuleValue === '' ? 'opacity-100' : 'opacity-0')} />
                                                </CommandItem>
                                                {modules.map((mod) => (
                                                    <CommandItem
                                                        key={mod.id}
                                                        value={mod.id}
                                                        onSelect={(currentValue) => {
                                                            const selected = currentValue === parentModuleValue ? '' : currentValue;
                                                            setParentModuleValue(selected);
                                                            setData('parent_id', selected || null);
                                                            setOpenParentModule(false);
                                                        }}
                                                    >
                                                        {mod.name}
                                                        <Check
                                                            className={cn('ml-auto', parentModuleValue === mod.id ? 'opacity-100' : 'opacity-0')}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Path</span>
                            <span className="text-muted-foreground text-xs">
                                Path of the module in the sidebar. This is used to generate the URL for the module.
                            </span>
                            <InputError message={errors.path} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                                defaultValue={data.path ?? ''}
                                onChange={(e) => setData('path', e.target.value)}
                                placeholder="Path"
                                name="path"
                                autoComplete="path"
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Client Route</span>
                            <span className="text-muted-foreground text-xs">
                                Determine if the module is a client route or not. This is used to generate the URL for the module in the client side.
                            </span>
                            <InputError message={errors.is_client} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Switch
                                id="is_client-mode"
                                checked={data.is_client}
                                onCheckedChange={(checked) => setData('is_client', !!checked)}
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Group Title</span>
                            <span className="text-muted-foreground text-xs">
                                Group title of the module in the sidebar. This is used to group the modules in the sidebar.
                            </span>
                            <InputError message={errors.group_title} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="text"
                                className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                                defaultValue={data.group_title}
                                onChange={(e) => setData('group_title', e.target.value)}
                                placeholder="Group Title"
                                name="group_title"
                                autoComplete="group_title"
                                disabled={!canUpdate('Modules')}
                            />
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Roles</span>
                            <span className="text-muted-foreground text-xs">The roles that have access to this module.</span>
                            <InputError message={errors.rolesId} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <input
                                name="role-search"
                                type="text"
                                placeholder="Search for role"
                                className="border-b text-xs focus:outline-none disabled:opacity-100"
                                value={roleSearch}
                                onChange={(e) => setRoleSearch(e.target.value)}
                                disabled={!canUpdate('Users')}
                            />
                            <ScrollArea className="flex max-h-52 w-48 flex-col gap-2 rounded p-2" id="roles">
                                {roles.filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase())).length > 0 ? (
                                    roles
                                        .filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase()))
                                        .map((role) => (
                                            <div key={role.id} className="mb-1 flex items-center gap-2 text-sm font-medium">
                                                <Checkbox
                                                    id={role.id}
                                                    checked={data.rolesId.includes(role.id)}
                                                    onCheckedChange={(checked) => handleToggle(role.id, !!checked)}
                                                    disabled={
                                                        !role.for_admin || !canUpdate('Modules') || currentUserRoles.some((r) => r.id === role.id)
                                                    }
                                                />
                                                <label
                                                    htmlFor={role.id}
                                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-muted-foreground text-xs italic">No role found.</p>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    <div className="flex items-stretch gap-3 border-y text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Available Actions</span>
                            <span className="text-muted-foreground text-xs">The actions that are available for this module.</span>
                            <InputError message={errors.available_actions} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <div className="flex flex-col gap-2">
                                {permissionActions.map((action) => {
                                    const checkboxId = `action-${action}`;
                                    const isChecked = data.available_actions.includes(action);

                                    return (
                                        <div key={checkboxId} className="flex items-center gap-2 text-sm font-medium">
                                            <Checkbox
                                                id={checkboxId}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    const updatedActions = checked
                                                        ? [...data.available_actions, action]
                                                        : data.available_actions.filter((a) => a !== action);
                                                    setData('available_actions', updatedActions);
                                                }}
                                                disabled={!canUpdate('Modules')}
                                            />
                                            <label htmlFor={checkboxId} className="text-sm leading-none font-medium">
                                                {action.replace('can_', '').replace('_', ' ').toUpperCase()}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {canUpdate('Modules') && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
