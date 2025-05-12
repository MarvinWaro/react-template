import { SharedData, User } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ModalUserProps {
    user: User;
    roleId: number | null;
}

interface RoleActions {
    roleId: number | null;
}

export function ModalUser({ user, roleId }: ModalUserProps) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = auth.user;
    const [isRoleRevoked, setIsRoleRevoked] = useState(false);

    const { post, delete: inertiaDelete } = useForm<Required<RoleActions>>({
        roleId: roleId,
    });

    const handleRevoke = () => {
        const promise = new Promise<void>((resolve, reject) => {
            if (!isRoleRevoked) {
                inertiaDelete(route('roles.revoke', user.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        resolve();
                    },
                    onError: () => {
                        reject();
                    },
                });
            } else {
                post(route('roles.revert', user.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        resolve();
                    },
                    onError: () => {
                        reject();
                    },
                });
            }
        });

        toast.promise(promise, {
            loading: !isRoleRevoked ? 'Revoking role...' : 'Reverting role...',
            success: !isRoleRevoked ? 'Role revoked successfully!' : 'Role reverted successfully!',
            error: !isRoleRevoked ? 'Failed to revoke role!' : 'Failed to revert role!',
            duration: 5000,
        });

        setIsRoleRevoked((prev) => !prev);
    };

    return (
        <div key={user.id} className="flex items-center justify-between rounded bg-gray-100 text-sm font-medium">
            <div className="flex items-center gap-1 ps-2">
                <span>{user.name}</span>
            </div>
            {currentUser.id !== user.id && (
                <div>
                    <button className={`${isRoleRevoked ? 'text-green-700' : 'text-red-700'} px-2 py-1 hover:bg-gray-300/60`} onClick={handleRevoke}>
                        {isRoleRevoked ? 'Revert' : 'Revoke'}
                    </button>
                </div>
            )}
        </div>
    );
}
