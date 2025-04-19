import Heading from '@/components/heading';
import CropDialog from '@/components/helpers/CropDialog';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Transition } from '@headlessui/react';
import { Head, router, useForm } from '@inertiajs/react';
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

interface UserWithRoles extends User {
    roles: Role[];
}

interface ViewUserProps {
    user: UserWithRoles;
    roles: Role[];
}

type UpdateUserForm = {
    name: string;
    new_avatar: File | null;
    email: string;
    rolesId: string[];
};

const ViewUser: React.FC<ViewUserProps> = ({ user, roles }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: `User #${user.name}`,
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
                onSuccess: () => {
                    reset('new_avatar');
                    resolve();
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated successfuly!',
            error: 'Failed to update user.',
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
            <Head title={`${user.name}`} />
            
            <div className="px-4 py-6">
                <Heading title="View User" description={`User #${user.name}`} />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Avatar className="size-20 cursor-pointer rounded-md">
                                {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />}
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{user.name}</DialogTitle>
                                <DialogDescription>{user.email}</DialogDescription>
                            </DialogHeader>
                            <Avatar className="size-full rounded-md">
                                {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />}
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </DialogContent>
                    </Dialog>
                    <form onSubmit={updateUser} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                value={data.name}
                                placeholder="Name"
                                required
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div>
                            <Label htmlFor="avatar">New Avatar</Label>
                            <Input type="file" id="avatar" name="avatar" accept="image/*" onChange={onFileChange} />
                            <InputError message={errors.new_avatar} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={data.email}
                                placeholder="Email"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} />
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
                        <div>
                            <Label htmlFor="roles">Roles</Label>
                            <div>
                                <input
                                    name="role-search"
                                    type="text"
                                    placeholder="Search for role"
                                    className="border-b text-xs focus:outline-none"
                                    value={roleSearch}
                                    onChange={(e) => setRoleSearch(e.target.value)}
                                />
                            </div>
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
                        <div className="flex items-center gap-2">
                            <Button type="submit" className="rounded bg-black px-4 py-1 text-white hover:bg-gray-800" disabled={processing}>
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
                    </form>
                </div>
            </div>

            {imageSrc && <CropDialog imageSrc={imageSrc} open={showCropModal} onClose={() => setShowCropModal(false)} onCropped={handleCropped} />}
        </AppLayout>
    );
};

export default ViewUser;
