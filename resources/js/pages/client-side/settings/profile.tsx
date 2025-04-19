import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import CropDialog from '@/components/helpers/CropDialog';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/client-layout';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    new_avatar: File | null;
    remove_avatar: boolean;
    email: string;
};

export default function ClientProfile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        new_avatar: null,
        remove_avatar: false,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const promise = new Promise<void>((resolve, reject) => {
            post(route('profile.update', auth.user.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset('new_avatar');
                    resolve();
                    inputFileRef.current!.value = '';
                },
                onError: () => {
                    reject();
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated!',
            error: 'Failed to update user.',
            duration: 5000,
        });
    };

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [showCropModal, setShowCropModal] = useState(false);

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />
                    <Label htmlFor="avatar">Current Avatar</Label>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Avatar className="mt-1 size-24 cursor-pointer rounded-md">
                                {auth.user.avatar && (
                                    <AvatarImage src={`/storage/${auth.user.avatar}`} alt={auth.user.name} className="object-cover" />
                                )}
                                <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                            </Avatar>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{auth.user.name}</DialogTitle>
                                <DialogDescription>{auth.user.email}</DialogDescription>
                            </DialogHeader>
                            <Avatar className="size-full rounded-md">
                                {auth.user.avatar && (
                                    <AvatarImage src={`/storage/${auth.user.avatar}`} alt={auth.user.name} className="object-cover" />
                                )}
                                <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                            </Avatar>
                        </DialogContent>
                    </Dialog>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="verified"
                                checked={data.remove_avatar}
                                onCheckedChange={(e) => {
                                    setData('remove_avatar', e as boolean);
                                    setData('new_avatar', null);
                                    inputFileRef.current!.value = '';
                                }}
                            />
                            <label
                                htmlFor="verified"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Remove Avatar
                            </label>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="avatar">New Avatar</Label>
                            <Input type="file" id="avatar" name="avatar" accept="image/*" onChange={onFileChange} ref={inputFileRef} />
                            <InputError message={errors.new_avatar} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null ? (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">Your email address is verified.</p>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

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

                <DeleteUser />
            </SettingsLayout>
            {imageSrc && <CropDialog imageSrc={imageSrc} open={showCropModal} onClose={() => setShowCropModal(false)} onCropped={handleCropped} />}
        </AppLayout>
    );
}
