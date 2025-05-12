import Heading from '@/components/heading';
import { DataTable } from '@/components/helpers/DataTable';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ExternalLink, KeyRound, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

interface UsersProps {
    users: {
        data: User[];
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
    allUsersCount: number;
}

type AddUserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Users({ users, tableData, allUsersCount }: UsersProps) {
    const { canCreate, canUpdate, canDelete } = usePermissions();

    const { auth, flash } = usePage<SharedData>().props;
    const getInitials = useInitials();

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
    } = useForm<Required<AddUserForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const promise = new Promise<void>((resolve, reject) => {
            post(route('users.register-user'), {
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
                    reset('password', 'password_confirmation');
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Creating user...',
            success: 'User created!',
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

    const deleteUser = (userId: number) => {
        const promise = new Promise<void>((resolve, reject) => {
            deleteInertia(route('users.delete-user', userId), {
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
                    reject('Failed to delete user.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Deleting user...',
            success: 'User deleted!',
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
            <Head title="Users" />
            <div className="px-4 py-6">
                <Heading title="Users" description="Manage the users of this system" />
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        {canCreate('Users') && (
                            <div className="flex w-full items-center justify-between gap-3 sm:w-max">
                                <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                                    <DialogTrigger asChild>
                                        <Button className="w-max">
                                            <Plus />
                                            Add User
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add User</DialogTitle>
                                            <DialogDescription>Fill out the form below to create a new user account.</DialogDescription>
                                        </DialogHeader>
                                        <form className="flex flex-col gap-6" onSubmit={submit}>
                                            <div className="grid gap-6">
                                                <div className="grid">
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        tabIndex={1}
                                                        autoComplete="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="Full name"
                                                    />
                                                    <InputError message={errors.name} className="mt-2" />
                                                </div>
                                                <div className="grid">
                                                    <Label htmlFor="email">Email address</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        required
                                                        tabIndex={2}
                                                        autoComplete="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="email@example.com"
                                                    />
                                                    <InputError message={errors.email} />
                                                </div>
                                                <div className="grid">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        required
                                                        tabIndex={3}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="Password"
                                                    />
                                                    <InputError message={errors.password} />
                                                </div>
                                                <div className="grid">
                                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                                    <Input
                                                        id="password_confirmation"
                                                        type="password"
                                                        required
                                                        tabIndex={4}
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="Confirm password"
                                                    />
                                                    <InputError message={errors.password_confirmation} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                    Create account
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                        <span className="flex items-center justify-center gap-2 text-sm font-medium text-red-700">
                                            <KeyRound size={16} />
                                            <div>The user is required to change their password upon first login.</div>
                                        </span>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                    <DataTable
                        enableSearch
                        searchDefaultValue={tableData.search}
                        enableSelect
                        onSelectionChange={(items) => {
                            console.log('Selected rows:', items);
                        }}
                        enableIndex
                        indexFrom={users.from}
                        headers={[
                            { key: 'name', label: 'Name' },
                            { key: 'email', label: 'Email' },
                            { key: 'activated_at', label: 'Activated At' },
                        ]}
                        data={users.data}
                        customData={[
                            {
                                key: 'name',
                                render: (user) => (
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            {user.avatar && (
                                                <AvatarImage
                                                    src={`/storage/${user.avatar}`}
                                                    alt={user.name}
                                                    className="size-8 rounded-full object-cover"
                                                />
                                            )}
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name}</span>
                                    </div>
                                ),
                            },
                            {
                                key: 'activated_at',
                                render: (user) =>
                                    user.activated_at ? (
                                        <span>{format(new Date(user.activated_at), 'MMMM d, yyyy h:mm a')}</span>
                                    ) : (
                                        <span className="text-gray-500">Not activated</span>
                                    ),
                            },
                        ]}
                        dataCount={allUsersCount}
                        filters={[
                            { key: 'verified', label: 'Verified' },
                            { key: 'active', label: 'Active' },
                        ]}
                        defaultFilters={tableData.filters}
                        actions={[
                            {
                                label: 'View',
                                className: 'bg-[#3b5998] hover:bg-[#3b5998]/90',
                                icon: <ExternalLink size={14} />,
                                showIf: (user) => canUpdate('Users'),
                                onClick: (user) => router.visit(route('users.view-user', user.id)),
                            },
                            {
                                label: 'Delete',
                                className: 'bg-[#983b3b] hover:bg-[#983b3b]/90',
                                icon: <Trash2 size={14} />,
                                showIf: (user) => canDelete('Users') && auth.user.id !== user.id,
                                onClick: (user) => {
                                    setIdToDelete(user.id);
                                    setOpenDeleteModal(true);
                                },
                            },
                        ]}
                        paginationCurrentPage={tableData.page}
                        paginationLastPage={users.last_page}
                        baseRoute="users"
                        defaultSort={tableData.sort}
                        defaultSortDirection={tableData.direction}
                        defaultPerPage={tableData.perPage}
                        perPagesDropdown={tableData.perPagesDropdown}
                    />

                    {idToDelete && (
                        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete the account and remove their data.
                                    </DialogDescription>
                                    <DialogFooter>
                                        <Button type="submit" variant={'danger'} onClick={() => deleteUser(idToDelete)}>
                                            Yes
                                        </Button>
                                    </DialogFooter>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
