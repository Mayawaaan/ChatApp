import { useState } from "react";
import { getInitials } from "../lib/utils";

const SIZE_CLASSES = {
  xs: "size-7 text-[11px]",
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-24 text-2xl",
};

const DOT_CLASSES = {
  xs: "size-2 ring-[1.5px]",
  sm: "size-2.5 ring-2",
  md: "size-2.5 ring-2",
  lg: "size-3 ring-2",
  xl: "size-4 ring-2",
};

const Avatar = ({
  src,
  name = "",
  size = "md",
  online = false,
  showStatus = false,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  return (
    <div className={`relative inline-flex shrink-0 ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name || "User avatar"}
          onError={() => setImgError(true)}
          className="w-full h-full rounded-full object-cover border border-border bg-surface-elevated"
        />
      ) : (
        <div
          aria-label={name || "User avatar"}
          className="w-full h-full rounded-full border border-border bg-primary-subtle text-primary font-heading font-semibold flex items-center justify-center select-none"
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && online && (
        <span
          title="Online"
          className={`absolute bottom-0 right-0 rounded-full bg-success ring-surface ${
            DOT_CLASSES[size] || DOT_CLASSES.md
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
