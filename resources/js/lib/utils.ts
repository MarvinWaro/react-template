import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isRouteActive(pageUrl: string, href: string | null, routes?: string[]) {
    if (!href && !routes) return false;
    return (href && pageUrl.startsWith(href)) || (routes && routes.some((route) => pageUrl.startsWith(route)));
}