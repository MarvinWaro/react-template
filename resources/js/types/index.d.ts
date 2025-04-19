import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    is_admin: boolean;
    modules: string[];
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
}

export interface SharedData {
    appCompany: string;
    appName: string;
    name: string;
    // quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
        message?: string;
    }
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
    [key: string]: unknown; // This allows for additional properties...
}

export interface Module {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}