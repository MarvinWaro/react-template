import Heading from '@/components/heading';
import { DataTable } from '@/components/helpers/DataTable';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { getLucideIcon } from '@/lib/get-lucide-icon';
import { SharedData, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { LoaderCircle, Plus, SquareDashedMousePointer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Modules',
        href: '/modules',
    },
];

interface Module {
    id: number;
    name: string;
    icon: string;
    path: string;
    order: number;
    is_client: boolean;
    description: string;
    created_at: string;
    updated_at: string;
    parent_name: string;
}

interface ModulesProps {
    modules: {
        data: Module[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        from: number;
    };
    tableData: {
        search: string;
        filters: string[];
        sort: string | null;
        direction: 'asc' | 'desc';
        page: number;
        perPage: number;
        perPagesDropdown: number[];
    };
    allModulesCount: number;
}

type AddModuleForm = {
    icon: string;
    order: number;
    name: string;
    description: string;
    path: string | null;
    group_title: string;
};

export default function Modules({ modules, tableData, allModulesCount }: ModulesProps) {
    const { canCreate, canUpdate, canDelete } = usePermissions();

    const [openAddModal, setOpenAddModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const {
        data,
        setData,
        post,
        delete: deleteInertia,
        processing,
        errors,
        reset,
    } = useForm<Required<AddModuleForm>>({
        icon: '',
        order: 0,
        name: '',
        description: '',
        path: null,
        group_title: '',
    });

    const deleteModule = (moduleId: number) => {
        const promise = new Promise<void>((resolve, reject) => {
            deleteInertia(route('modules.delete-module', moduleId), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    setOpenDeleteModal(false);
                    setIdToDelete(null);

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }
                },
                onError: () => {
                    setOpenDeleteModal(false);
                    setIdToDelete(null);
                    reject('Failed to delete module.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Deleting module...',
            success: 'Module deleted!',
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

    const submitAddModule = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const promise = new Promise<void>((resolve, reject) => {
            post(route('modules.add-module'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    resolve();
                    setOpenAddModal(false);
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Creating module...',
            success: 'Module created successfully!',
            error: 'Failed to create module!',
            duration: 5000,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modules" />
            <div className="px-4 py-6">
                <Heading title="Modules" description="Manage the modules of the system." />
                <div className="flex flex-col gap-2">
                    {canCreate('Modules') && (
                        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                            <DialogTrigger asChild>
                                <Button className="w-max">
                                    <Plus />
                                    Add Module
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Module</DialogTitle>
                                    <DialogDescription>Fill out the form below to create a new module.</DialogDescription>
                                </DialogHeader>
                                <form className="flex flex-col gap-6" onSubmit={submitAddModule}>
                                    <div className="grid gap-6">
                                        <div className="grid">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="icon" className="flex flex-col gap-0.5">
                                                    Module Icon
                                                    <span className="text-xs text-gray-500">
                                                        <span>
                                                            Icon of the module in the sidebar. This is used to display the icon of the module in the
                                                            sidebar.
                                                        </span>
                                                        <a
                                                            href="https://lucide.dev/icons/"
                                                            className="ml-1"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <span className="text-blue-500 underline">Click here</span>
                                                        </a>
                                                        <span className="ml-1">to see the available icons.</span>
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="icon"
                                                    type="text"
                                                    required
                                                    tabIndex={0}
                                                    autoComplete="icon"
                                                    value={data.icon}
                                                    onChange={(e) => setData('icon', e.target.value)}
                                                    disabled={processing}
                                                    placeholder="Module icon from Lucide (e.g., LayoutGrid)"
                                                />
                                            </div>
                                            <InputError message={errors.icon} className="mt-2" />
                                        </div>
                                        <div className="grid">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="order">Module Order</Label>
                                                <Input
                                                    id="order"
                                                    type="number"
                                                    required
                                                    tabIndex={1}
                                                    autoComplete="order"
                                                    value={data.order}
                                                    onChange={(e) => setData('order', parseInt(e.target.value))}
                                                    disabled={processing}
                                                    placeholder="Module order"
                                                />
                                            </div>
                                            <InputError message={errors.order} className="mt-2" />
                                        </div>
                                        <div className="grid">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="name">Module Name</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    disabled={processing}
                                                    placeholder="Module name"
                                                />
                                            </div>
                                            <InputError message={errors.name} className="mt-2" />
                                        </div>
                                        <div className="grid">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="description">Module Description</Label>
                                                <Input
                                                    id="description"
                                                    type="text"
                                                    tabIndex={3}
                                                    autoComplete="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    disabled={processing}
                                                    placeholder="Module description"
                                                />
                                            </div>

                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                        <div className="grid">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="path">Module Path</Label>
                                                <Input
                                                    id="path"
                                                    type="text"
                                                    tabIndex={4}
                                                    autoComplete="path"
                                                    value={data.path ?? ''}
                                                    onChange={(e) => setData('path', e.target.value)}
                                                    disabled={processing}
                                                    placeholder="Module path (e.g., /admin/dashboard)"
                                                />
                                            </div>
                                            <InputError message={errors.path} className="mt-2" />
                                        </div>
                                        <div className="grid">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="group_title">Module Group Title</Label>
                                                <Input
                                                    id="group_title"
                                                    type="text"
                                                    required
                                                    tabIndex={5}
                                                    autoComplete="group_title"
                                                    value={data.group_title ?? ''}
                                                    onChange={(e) => setData('group_title', e.target.value)}
                                                    disabled={processing}
                                                    placeholder="Module group title (e.g., User Management)"
                                                />
                                            </div>
                                            <InputError message={errors.group_title} className="mt-2" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Create Module
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <DataTable
                        enableSearch
                        searchDefaultValue={tableData.search}
                        indexFrom={modules.from}
                        enableIndex={false}
                        headers={[
                            { key: 'order', label: 'Order' },
                            { key: 'icon', label: 'Icon' },
                            { key: 'name', label: 'Name' },
                            { key: 'description', label: 'Description' },
                            { key: 'parent_name', label: 'Parent', sortable: false },
                            { key: 'path', label: 'Path' },
                            { key: 'is_client', label: 'Path Type' },
                            { key: 'group_title', label: 'Group Title' },
                            { key: 'created_at', label: 'Date Created' },
                        ]}
                        data={modules.data}
                        customData={[
                            {
                                key: 'order',
                                render: (module) => <span className="text-center">{module.order}</span>,
                            },
                            {
                                key: 'icon',
                                render: (module) => {
                                    const Icon = getLucideIcon(module.icon);

                                    return Icon ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Icon size={16} />
                                                </TooltipTrigger>
                                                <TooltipContent>{module.icon}</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <span className="text-gray-500">{module.icon}</span>
                                    );
                                },
                            },
                            {
                                key: 'description',
                                render: (module) =>
                                    module.description ? <span>{module.description}</span> : <span className="text-gray-500">No description</span>,
                            },
                            {
                                key: 'path',
                                render: (module) =>
                                    module.path ? <Badge variant={'outline'}>{module.path}</Badge> : <span className="text-gray-500">No path</span>,
                            },
                            {
                                key: 'is_client',
                                render: (module) => (module.is_client ? <span>Client</span> : <span>Admin</span>),
                            },
                            {
                                key: 'parent_name',
                                render: (module) =>
                                    module.parent_name ? (
                                        <Badge variant={'outline'}>{module.parent_name}</Badge>
                                    ) : (
                                        <span className="text-gray-500">No parent</span>
                                    ),
                            },
                            {
                                key: 'created_at',
                                render: (module) =>
                                    module.created_at ? (
                                        <span>{format(new Date(module.created_at), 'MMMM d, yyyy h:mm a')}</span>
                                    ) : (
                                        <span className="text-gray-500">Not activated</span>
                                    ),
                            },
                        ]}
                        actions={[
                            {
                                label: 'Manage Module',
                                className: 'bg-[#6366f1] hover:bg-[#6366f1]/90',
                                icon: <SquareDashedMousePointer size={14} />,
                                showIf: (module) => canUpdate('Modules'),
                                onClick: (module) => router.visit(route('modules.view', module.id), { preserveScroll: true }),
                            },
                            {
                                label: 'Delete',
                                className: 'bg-[#983b3b] hover:bg-[#983b3b]/90',
                                icon: <Trash2 size={14} />,
                                showIf: (module) => canDelete('Modules'),
                                onClick: (module) => {
                                    setIdToDelete(module.id);
                                    setOpenDeleteModal(true);
                                },
                            },
                        ]}
                        dataCount={allModulesCount}
                        defaultFilters={tableData.filters}
                        paginationCurrentPage={tableData.page}
                        paginationLastPage={modules.last_page}
                        baseRoute="modules"
                        defaultSort={tableData.sort}
                        defaultSortDirection={tableData.direction}
                        defaultPerPage={tableData.perPage}
                        perPagesDropdown={tableData.perPagesDropdown}
                    />
                </div>
                {idToDelete && (
                    <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete the module and all of its data.
                                </DialogDescription>
                                <DialogFooter>
                                    <Button type="submit" variant={'danger'} onClick={() => deleteModule(idToDelete)}>
                                        Yes
                                    </Button>
                                </DialogFooter>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}
