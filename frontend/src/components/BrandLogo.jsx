import { BRAND } from "../config/brand";

const BrandLogo = ({ size = "md", showTagline = false }) => {
  const iconSize = size === "sm" ? "w-6 h-6 rounded-md" : size === "lg" ? "w-9 h-9 rounded-xl" : "w-7 h-7 rounded-lg";
  const textSize = size === "sm" ? "text-[15px]" : size === "lg" ? "text-xl" : "text-base";

  return (
    <div className="inline-flex items-center gap-2 select-none">
      <div
        className={`${iconSize} bg-primary text-primary-foreground flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 28 28" className="w-[64%] h-[64%]" fill="none">
          <path
            d="M4.5 7.5C4.5 5.84315 5.84315 4.5 7.5 4.5H17.5C19.1569 4.5 20.5 5.84315 20.5 7.5V13.5C20.5 15.1569 19.1569 16.5 17.5 16.5H11L6.5 20V16.5C5.39543 16.5 4.5 15.6046 4.5 14.5V7.5Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M11 13.5C11 12.1193 12.1193 11 13.5 11H21C22.3807 11 23.5 12.1193 23.5 13.5V19C23.5 20.3807 22.3807 21.5 21 21.5H19L21.5 24.5L16.5 21.5H13.5C12.1193 21.5 11 20.3807 11 19V13.5Z"
            fill="currentColor"
            fillOpacity="0.45"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${textSize} font-heading font-semibold tracking-tight text-foreground`}>
          {BRAND.name}
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground mt-0.5">
            {BRAND.tagline}
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
