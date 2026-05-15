// app/dashboard/basic/[slug]/(tabs)/layout.tsx
import BottomNav from '@/components/BottomNav'
import { Suspense } from 'react'

export default async function TabsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { slug: string }
}) {
    const { slug } = await params

    return (
        <div className="flex flex-col min-h-screen">
            {/* This main area will scroll, leaving the nav fixed */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* The BottomNav is now only on these sub-pages */}
            <Suspense fallback={<div className="h-12 bg-grey-100 animate-pulse" />}>
            <BottomNav slug={slug} />
            </Suspense>
        </div>
    )
}