import type { LucideProps } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type LucideIconComponent = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

export function getLucideIcon(name: string): LucideIconComponent | null {
    const Icon = LucideIcons[name as keyof typeof LucideIcons];

    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in Icon)) {
        return Icon as LucideIconComponent;
    }

    return null;
}
