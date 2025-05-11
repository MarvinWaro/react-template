import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const permissionActions = ['can_view', 'can_create', 'can_update', 'can_delete', 'can_export', 'can_print'];

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;

    const permissions = auth.permissions ?? {};

    const isSuperAdmin = auth.is_super_admin;

    const hasPermission = (module: string, action: string): boolean => {
        if (isSuperAdmin) return true;
        return Array.isArray(permissions[module]) && permissions[module].includes(action);
    };

    const canView = (module: string) => hasPermission(module, 'can_view');
    const canCreate = (module: string) => hasPermission(module, 'can_create');
    const canUpdate = (module: string) => hasPermission(module, 'can_update');
    const canDelete = (module: string) => hasPermission(module, 'can_delete');
    const canExport = (module: string) => hasPermission(module, 'can_export');
    const canPrint = (module: string) => hasPermission(module, 'can_print');

    return {
        hasPermission,
        canView,
        canCreate,
        canUpdate,
        canDelete,
        canExport,
        canPrint,
    };
}
