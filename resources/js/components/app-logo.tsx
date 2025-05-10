import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';
import AppLogoIcon from './app-logo-icon';

function AppLogoComponent() {
    const page = usePage<SharedData>();
    const { appCompany, appName } = page.props;

    return (
        <>
            <div>
                <AppLogoIcon />
            </div>
            <div className="grid flex-1 text-left text-sm">
                <span className="truncate font-bold">{appCompany}</span>
                <span className="truncate text-gray-800 dark:text-gray-400">{appName}</span>
            </div>
        </>
    );
}

const AppLogo = React.memo(AppLogoComponent);
export default AppLogo;
