// app/dashboard/basic/[slug]/(tabs)/layout.tsx
import BottomNav from '@/components/BottomNav'

export default async function TabsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    return (
        <div className="flex flex-col min-h-screen">
            {/* This main area will scroll, leaving the nav fixed */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* The BottomNav is now only on these sub-pages */}
            <BottomNav slug={slug} />
        </div>
    )
}