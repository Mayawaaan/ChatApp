const MessageSkeleton = () => {
  const skeletonMessages = [
    { own: false, width: "w-52" },
    { own: true, width: "w-64" },
    { own: false, width: "w-44" },
    { own: true, width: "w-56" },
    { own: false, width: "w-60" },
    { own: true, width: "w-40" },
  ];

  return (
    <div
      aria-label="Loading messages"
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-background/50"
    >
      {skeletonMessages.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-end gap-2.5 ${
            item.own ? "justify-end" : "justify-start"
          }`}
        >
          {!item.own && (
            <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
          )}
          <div className={`space-y-1.5 ${item.own ? "items-end" : "items-start"} flex flex-col`}>
            <div
              className={`h-11 ${item.width} rounded-2xl bg-muted animate-pulse`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
