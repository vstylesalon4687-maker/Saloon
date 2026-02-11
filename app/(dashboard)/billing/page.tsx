"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { BillingHome } from "@/components/billing/BillingHome";
import { CreateBill } from "@/components/billing/CreateBill";
import { Suspense } from "react";

function BillingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isCreateMode = searchParams.get('action') === 'create';

    const handleCreate = () => {
        router.push("/billing?action=create");
    };

    const handleBack = () => {
        router.push("/billing");
    };

    if (isCreateMode) {
        return <CreateBill onBack={handleBack} />;
    }

    return <BillingHome onCreate={handleCreate} />;
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="p-4 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <BillingPageContent />
        </Suspense>
    );
}
