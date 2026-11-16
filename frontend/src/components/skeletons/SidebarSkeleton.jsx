const SidebarSkeleton = () => {
  const skeletonContacts = Array(7).fill(null);

  return (
    <aside
      aria-label="Loading conversations"
      className="h-full w-full md:w-76 lg:w-80 border-r border-border bg-surface flex flex-col shrink-0"
    >
      <div className="p-3.5 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-muted animate-pulse" />
          <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-8 w-full rounded-md bg-muted animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full px-2.5 py-2.5 flex items-center gap-3 rounded-lg">
            <div className="size-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-8 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-2.5 w-36 rounded bg-muted/80 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
