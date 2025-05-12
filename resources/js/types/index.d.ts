import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface ModulePermissions {
    can_view: number;
    can_create: number;
    can_update: number;
    can_delete: number;
    can_export: number;
    can_print: number;
}

export interface Role {
    id: string;
    name: string;
    description: string;    
    created_at: string;
    updated_at: string;
    for_admin: boolean;
}

export interface Auth {
    user: User;
    is_admin: boolean;
    is_super_admin: boolean;
    permissions: {
        [moduleName: string]: ModulePermissions;
    };
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    subItems?: NavItem[];
    routes?: string[];
    permissions?: string[];
}

export interface SharedData {
    appCompany: string;
    appName: string;
    name: string;
    // quote: { message: string; author: string };
    navigations: Record<string, NavigationModule[]>;
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
        message?: string;
    };
    isClientRoute: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    activated_at: string | null;
    roles: Role[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface NavigationModule {
    id: string;
    name: string;
    icon: string;
    path: string | null;
    parent_id: string | null;
    description?: string;
    is_client: boolean;
    available_actions: string[] | null;
    created_at: string;
    updated_at: string;
    children?: NavigationModule[];
}
