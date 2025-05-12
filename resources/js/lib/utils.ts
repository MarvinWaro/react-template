import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isRouteActive(pageUrl: string, href: string | null, routes?: string[]) {
    if (!href && !routes) return false;

    const normalize = (url: string) => url.replace(/\/+$/, ''); // remove trailing slash

    const normalizedPageUrl = normalize(pageUrl);
    const normalizedHref = href ? normalize(href) : null;

    const hrefMatch =
        normalizedHref &&
        (normalizedPageUrl === normalizedHref || normalizedPageUrl.startsWith(normalizedHref + '/'));

    const routeMatch = routes?.some((route) => {
        const normalizedRoute = normalize(route);
        return (
            normalizedPageUrl === normalizedRoute ||
            normalizedPageUrl.startsWith(normalizedRoute + '/')
        );
    });

    return hrefMatch || !!routeMatch;
}