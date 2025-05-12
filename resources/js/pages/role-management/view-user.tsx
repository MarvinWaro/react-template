import Heading from '@/components/heading';
import CropDialog from '@/components/helpers/CropDialog';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Dialog } from '@radix-ui/react-dialog';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface Role {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    users: User[];
    pivot: {
        user_id: string;
        role_id: string;
    };
}

interface ViewUserProps {
    user: User;
    roles: Role[];
}

type UpdateUserForm = {
    name: string;
    new_avatar: File | null;
    email: string;
    rolesId: string[];
};

const ViewUser: React.FC<ViewUserProps> = ({ user, roles }) => {
    const { canUpdate } = usePermissions();

    const { auth } = usePage<SharedData>().props;
    const currentUser = auth.user;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: user.name,
            href: `/view-user/${user.id}`,
        },
    ];

    const getInitials = useInitials();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const [roleSearch, setRoleSearch] = useState('');

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropped = (file: File) => {
        setData('new_avatar', file);
    };

    const { data, setData, errors, post, processing, recentlySuccessful, reset } = useForm<Required<UpdateUserForm>>({
        name: user.name,
        new_avatar: null,
        email: user.email,
        rolesId: user.roles.map((role) => role.id),
    });

    const updateUser: FormEventHandler = (e) => {
        e.preventDefault();

        const promise = new Promise<void>((resolve, reject) => {
            post(route('users.update-user', user.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    reset('new_avatar');

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }
                },
                onError: () => {
                    reject('Failed to update user.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated successfuly!',
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

    const handleToggle = (roleId: string, checked: boolean) => {
        setData((prev) => {
            const rolesId = checked ? [...prev.rolesId, roleId] : prev.rolesId.filter((id) => id !== roleId);
            return { ...prev, rolesId };
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="px-4 py-6">
                <Heading title={user.name} description={user.email} />
                <div className="flex flex-col">
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Name</span>
                            <span className="text-muted-foreground text-xs">
                                The name of the user. This is the name that will be displayed on the user profile.
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
                            <span>Email</span>
                            <span className="text-muted-foreground text-xs">
                                The email of the user. This is the email that will be used to login to the user profile.
                            </span>
                            <InputError message={errors.email} className="mt-2 text-xs" />
                        </div>
                        <div className="my-auto py-3">
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={data.email}
                                placeholder="Email"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={!canUpdate('Users')}
                                className="disabled:opacity-100"
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Current Avatar</span>
                            <span className="text-muted-foreground text-xs">The current avatar of the user.</span>
                        </div>
                        <div className="my-auto py-3">
                            {user.avatar ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Avatar className="size-20 cursor-pointer rounded-md">
                                            {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />}
                                            <AvatarFallback className="rounded-md">{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>{user.name}'s Avatar</DialogTitle>
                                            <DialogDescription>{user.email}</DialogDescription>
                                        </DialogHeader>
                                        <Avatar className="size-full rounded-md">
                                            {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />}
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <Avatar className="size-20 rounded-md">
                                    <AvatarFallback className="rounded-md">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    </div>

                    {canUpdate('Users') && (
                        <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                            <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                                <span>New Avatar</span>
                                <span className="text-muted-foreground text-xs">
                                    The new avatar of the user. This is the image that will be displayed on the user profile.
                                </span>
                                <InputError message={errors.new_avatar} className="mt-2 text-xs" />
                            </div>
                            <div className="my-auto py-3">
                                <Input
                                    type="file"
                                    id="avatar"
                                    name="avatar"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    disabled={!canUpdate('Users')}
                                    className="disabled:opacity-100"
                                />
                            </div>
                        </div>
                    )}

                    {canUpdate('Users') && (
                        <div className="flex items-stretch gap-3 border-t text-sm font-medium">
                            <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                                <span>Password Reset</span>
                                <span className="text-muted-foreground text-xs">
                                    The password reset link of the user. This is the link that will be used to reset the password of the user.
                                </span>
                            </div>
                            <div className="my-auto py-3">
                                <button
                                    className="cursor-pointer text-sm text-blue-500"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const promise = new Promise<void>((resolve, reject) => {
                                            router.post(
                                                route('password.email'),
                                                { email: user.email },
                                                { preserveScroll: true, onSuccess: () => resolve(), onError: () => reject() },
                                            );
                                        });

                                        toast.promise(promise, {
                                            loading: 'Sending password reset link...',
                                            success: 'Password reset link sent!',
                                            error: 'Failed to send password reset link.',
                                            duration: 5000,
                                        });
                                    }}
                                >
                                    Send password reset link
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-stretch gap-3 border-y text-sm font-medium">
                        <div className="flex w-100 flex-col gap-0 border-r py-3 pr-3">
                            <span>Roles</span>
                            <span className="text-muted-foreground text-xs">
                                The roles of the user. This is the list of roles that the user has. The user will have access to the modules that are
                                assigned to the roles.
                            </span>
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
                                                    disabled={!canUpdate('Users')}
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

                    {canUpdate('Users') && (
                        <div className="flex items-center gap-2 pt-3">
                            <Button
                                type="submit"
                                className="rounded bg-black px-4 py-1 text-white hover:bg-gray-800"
                                disabled={processing}
                                onClick={updateUser}
                            >
                                Update User
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
                    )}
                </div>
            </div>

            {imageSrc && <CropDialog imageSrc={imageSrc} open={showCropModal} onClose={() => setShowCropModal(false)} onCropped={handleCropped} />}
        </AppLayout>
    );
};

export default ViewUser;
