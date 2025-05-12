import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { getLucideIcon } from '@/lib/get-lucide-icon';
import { isRouteActive } from '@/lib/utils';
import { NavigationModule, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function NavMain() {
    const { navigations } = usePage<SharedData>().props;

    const page = usePage();

    const { canView } = usePermissions();

    const isModuleAccessible = (moduleName: string): boolean => {
        return canView(moduleName);
    };

    return Object.entries(navigations).map(([groupTitle, modules]) => {
        const accessibleItems = modules.filter((mod: NavigationModule) => isModuleAccessible(mod.name));

        if (accessibleItems.length === 0) return null;

        return (
            <SidebarGroup key={groupTitle}>
                <SidebarGroupLabel>{groupTitle}</SidebarGroupLabel>
                <SidebarMenu>
                    {accessibleItems.map((module: NavigationModule) => {
                        const Icon = getLucideIcon(module.icon);

                        const accessibleSubItems = module.children?.filter((sub: NavigationModule) => isModuleAccessible(sub.name)) ?? [];

                        const isActiveParent = isRouteActive(page.url, module.path);
                        const isActiveSub = accessibleSubItems.some((sub) => isRouteActive(page.url, sub.path));
                        const shouldBeOpen = isActiveParent || isActiveSub;

                        if (accessibleSubItems.length > 0) {
                            return (
                                <Collapsible key={module.id} asChild defaultOpen={shouldBeOpen} className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={module.name} isActive={isActiveParent}>
                                                {Icon && <Icon size={16} className="text-gray-700" />}
                                                <Link href={module.path ?? '#'} prefetch>
                                                    <span>{module.name}</span>
                                                </Link>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {accessibleSubItems.map((sub: NavigationModule) => (
                                                    <SidebarMenuSubItem key={sub.id}>
                                                        <SidebarMenuSubButton asChild isActive={isRouteActive(page.url, sub.path)}>
                                                            <Link href={sub.path ?? '#'} prefetch>
                                                                <span>{sub.name}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            );
                        }

                        return (
                            <SidebarMenuItem key={module.id}>
                                <SidebarMenuButton tooltip={module.name} isActive={isActiveParent} asChild>
                                    <Link href={module.path ?? '#'} prefetch>
                                        {Icon && <Icon size={16} className="text-gray-700" />}
                                        <span>{module.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>
        );
    });
}
