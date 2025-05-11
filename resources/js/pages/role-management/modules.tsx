import Heading from '@/components/heading';
import { DataTable } from '@/components/helpers/DataTable';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { LayoutGrid, LoaderCircle, Pi, Plus, SquareDashedMousePointer, Trash2, UserRoundCog, UsersRound } from 'lucide-react';
import { JSX, useState } from 'react';
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
    name: string;
    description: string;
};

export default function Modules({ modules, tableData, allModulesCount }: ModulesProps) {
    const [openAddModal, setOpenAddModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<AddModuleForm>>({
        name: '',
        description: '',
    });

    const deleteModule = (moduleId: number) => {
        if (confirm('Are you sure you want to delete this module?')) {
            router.delete(route('modules.delete-module', moduleId), {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Module deleted successfully!');
                },
                onError: (errors) => {
                    alert('Failed to delete module.' + errors.message);
                },
            });
        }
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
                                            <Label htmlFor="name">Role Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                tabIndex={0}
                                                autoComplete="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                disabled={processing}
                                                placeholder="Full name"
                                            />
                                        </div>
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>
                                    <div className="grid">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="description">Role Description</Label>
                                            <Input
                                                id="description"
                                                type="text"
                                                tabIndex={1}
                                                autoComplete="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                disabled={processing}
                                                placeholder="Description"
                                            />
                                        </div>

                                        <InputError message={errors.description} className="mt-2" />
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
                    <DataTable
                        enableSearch
                        searchDefaultValue={tableData.search}
                        indexFrom={modules.from}
                        enableIndex
                        headers={[
                            { key: 'order', label: 'Order' },
                            { key: 'icon', label: 'Icon' },
                            { key: 'name', label: 'Name' },
                            { key: 'description', label: 'Description' },
                            { key: 'parent_name', label: 'Parent' },
                            { key: 'path', label: 'Path' },
                            { key: 'is_client', label: 'Path Type' },
                            { key: 'group_title', label: 'Group Title' },
                            { key: 'created_at', label: 'Date Created' },
                        ]}
                        data={modules.data}
                        customData={[
                            {
                                key: 'order',
                                render: (module) => <span>{module.order + 1}</span>,
                            },
                            {
                                key: 'icon',
                                render: (module) => {
                                    const IconComponent = iconMap[module.icon] ?? null;

                                    return IconComponent ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>{IconComponent}</TooltipTrigger>
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
                                render: (module) => (module.path ? <Badge>{module.path}</Badge> : <span className="text-gray-500">No path</span>),
                            },
                            {
                                key: 'is_client',
                                render: (module) => (module.is_client ? <span>Client</span> : <span>Admin</span>),
                            },
                            {
                                key: 'parent_name',
                                render: (module) =>
                                    module.parent_name ? <span>{module.parent_name}</span> : <span className="text-gray-500">No parent</span>,
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
                                onClick: (module) => router.visit(route('modules.view', module.id), { preserveScroll: true }),
                            },
                            {
                                label: 'Delete',
                                className: 'bg-[#983b3b] hover:bg-[#983b3b]/90',
                                icon: <Trash2 size={14} />,
                                onClick: (module) => deleteModule(module.id),
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
            </div>
        </AppLayout>
    );
}

export const iconMap: Record<string, JSX.Element> = {
    LayoutGrid: <LayoutGrid size={16} />,
    UsersRound: <UsersRound size={16} />,
    UserRoundCog: <UserRoundCog size={16} />,
    SquareDashedMousePointer: <SquareDashedMousePointer size={16} />,
    Pi: <Pi size={16} />,
};
