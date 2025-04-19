import React from 'react';

function AppLogoIconComponent() {
    return (
        <div className="size-10 group-data-[collapsible=icon]:size-8 transition-all">
            <img src="/ched-logo.png" alt="chedro-12" />
        </div>
    );
}

const AppLogoIcon = React.memo(AppLogoIconComponent);
export default AppLogoIcon;
