import Heading from '@/components/heading';
import { DataTable } from '@/components/helpers/DataTable';
import InputError from '@/components/input-error';
import { ModalUser } from '@/components/roles/modal-user';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { LoaderCircle, Plus, ScanFace, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

interface Role {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    users: User[];
}

interface RoleProps {
    roles: {
        data: Role[];
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
    allRolesCount: number;
}

type AddRoleForm = {
    name: string;
    description: string;
};

export default function Roles({ roles, tableData, allRolesCount }: RoleProps) {
    const { canCreate, canUpdate, canDelete } = usePermissions();

    const [openUsersModal, setOpenUsersModal] = useState(false);
    const [modalUsers, setModalUsers] = useState<User[]>([]);
    const [currentRoleName, setCurrentRoleName] = useState<string>('');
    const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

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
    } = useForm<Required<AddRoleForm>>({
        name: '',
        description: '',
    });

    const deleteRole = (roleId: number) => {
        const promise = new Promise<void>((resolve, reject) => {
            deleteInertia(route('roles.delete-role', roleId), {
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
                    reject('Failed to delete role.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Deleting role...',
            success: 'Role deleted!',
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

    const handleOpenModal = (roleName: string, roleId: number, users: User[]) => {
        setCurrentRoleName(roleName);
        setCurrentRoleId(roleId);
        setModalUsers(users);
        setOpenUsersModal(true);
    };

    const submitAddRole = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const promise = new Promise<void>((resolve, reject) => {
            post(route('roles.add-role'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    reset();
                    setOpenAddModal(false);

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }
                },
                onError: () => {
                    reject('Failed to create role.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Creating role...',
            success: 'Role created successfully!',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="px-4 py-6">
                <Heading title="Roles" description="Manage the roles and permissions for your users" />
                <div className="flex flex-col gap-2">
                    {canCreate('Roles') && (
                        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                            <DialogTrigger asChild>
                                <Button className="w-max">
                                    <Plus />
                                    Add Role
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Role</DialogTitle>
                                    <DialogDescription>Fill out the form below to create a new role.</DialogDescription>
                                </DialogHeader>
                                <form className="flex flex-col gap-6" onSubmit={submitAddRole}>
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
                                            Create Role
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <DataTable
                        enableSearch
                        searchDefaultValue={tableData.search}
                        indexFrom={roles.from}
                        enableIndex
                        headers={[
                            { key: 'name', label: 'Name' },
                            { key: 'description', label: 'Description' },
                            { key: 'users_count', label: 'Users', sortable: false },
                            { key: 'created_at', label: 'Date Created' },
                        ]}
                        data={roles.data}
                        customData={[
                            {
                                key: 'description',
                                render: (role) =>
                                    role.description ? <span>{role.description}</span> : <span className="text-gray-500">No description</span>,
                            },
                            {
                                key: 'created_at',
                                render: (role) =>
                                    role.created_at ? (
                                        <span>{format(new Date(role.created_at), 'MMMM d, yyyy h:mm a')}</span>
                                    ) : (
                                        <span className="text-gray-500">Not activated</span>
                                    ),
                            },
                            {
                                key: 'users_count',
                                render: (role) => (role.users ? <span>{role.users.length}</span> : <span className="text-gray-500">No users</span>),
                            },
                        ]}
                        actions={[
                            {
                                label: 'Manage Role',
                                className: 'bg-[#6366f1] hover:bg-[#6366f1]/90',
                                icon: <ScanFace size={14} />,
                                showIf: (role) => canUpdate('Roles'),
                                onClick: (role) => router.visit(route('roles.view', role.id), { preserveScroll: true }),
                            },
                            {
                                label: 'Users',
                                className: 'bg-[#3b82f6] hover:bg-[#3b82f6]/90',
                                icon: <UsersRound size={14} />,
                                showIf: (role) => role.users.length > 0,
                                onClick: (role) => handleOpenModal(role.name, role.id, role.users),
                            },
                            {
                                label: 'Delete',
                                className: 'bg-[#983b3b] hover:bg-[#983b3b]/90',
                                icon: <Trash2 size={14} />,
                                showIf: (role) => canDelete('Roles'),
                                onClick: (role) => {
                                    setIdToDelete(role.id);
                                    setOpenDeleteModal(true);
                                },
                            },
                        ]}
                        dataCount={allRolesCount}
                        defaultFilters={tableData.filters}
                        paginationCurrentPage={tableData.page}
                        paginationLastPage={roles.last_page}
                        baseRoute="roles"
                        defaultSort={tableData.sort}
                        defaultSortDirection={tableData.direction}
                        defaultPerPage={tableData.perPage}
                        perPagesDropdown={tableData.perPagesDropdown}
                    />
                </div>
            </div>
            <Dialog open={openUsersModal} onOpenChange={setOpenUsersModal} modal>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentRoleName}</DialogTitle>
                        <DialogDescription>These are the users with this role.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        {modalUsers.map((user) => (
                            <ModalUser user={user} key={user.id} roleId={currentRoleId} />
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            {idToDelete && (
                <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the role and all its associated permissions.
                            </DialogDescription>
                            <DialogFooter>
                                <Button type="submit" variant={'danger'} onClick={() => deleteRole(idToDelete)}>
                                    Yes
                                </Button>
                            </DialogFooter>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
