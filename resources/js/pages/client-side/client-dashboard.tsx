import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function ClientDashboard() {
    return (
        <>
            <AppLayout>
                <Head title="Dashboard" />
                <div className="px-4 py-6 ">
                    <Heading title="Dashboard" description="Welcome to your dashboard" />
                </div>
            </AppLayout>
        </>
    );
}
