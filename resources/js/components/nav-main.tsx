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
import { isRouteActive } from '@/lib/utils';
import { iconMap } from '@/pages/role-management/modules';
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
                        const Icon = module.icon ? iconMap[module.icon] : null;

                        const accessibleSubItems = module.children?.filter((sub: NavigationModule) => isModuleAccessible(sub.name)) ?? [];

                        if (accessibleSubItems.length > 0) {
                            return (
                                <Collapsible
                                    key={module.id}
                                    asChild
                                    defaultOpen={module.path === page.url || accessibleSubItems.some((sub) => sub.path === page.url)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={module.name} isActive={isRouteActive(page.url, module.path)}>
                                                {Icon}
                                                <span>{module.name}</span>
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
                                <SidebarMenuButton tooltip={module.name} isActive={isRouteActive(page.url, module.path)} asChild>
                                    <Link href={module.path ?? '#'} prefetch>
                                        {Icon}
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
