const QRCodeListSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
            <div
                key={i}
                className="animate-pulse flex flex-col rounded-xl border border-gray-800 bg-gray-850 p-4"
            >
                <div className="flex items-center justify-between">
                    <div className="h-4 w-16 rounded bg-gray-700" />
                    <div className="h-3 w-8 rounded bg-gray-700" />
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md bg-gray-700" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-700" />
                        <div className="h-3 w-1/2 rounded bg-gray-700" />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <div className="h-8 w-20 rounded bg-gray-700" />
                    <div className="flex gap-2">
                        <div className="h-8 w-8 rounded bg-gray-700" />
                        <div className="h-8 w-8 rounded bg-gray-700" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default QRCodeListSkeleton;