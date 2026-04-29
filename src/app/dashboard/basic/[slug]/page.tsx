// Temporary debug page
export default function DebugPage({ params }: { params: { slug: string } }) {
    return (
        <div className="p-20 bg-white">
            <h1 className="text-black">The Slug is: {params.slug}</h1>
            <p className="text-gray-500">If you see this, the routing is working!</p>
        </div>
    );
}