import { BRAND } from "../config/brand";

const NoChatSelected = () => {
  return (
    <section
      aria-label="No conversation selected"
      className="hidden md:flex flex-1 flex-col items-center justify-center p-10 bg-background"
    >
      <div className="max-w-sm text-center space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {BRAND.name}
        </p>
        <h2 className="text-lg font-heading font-semibold text-foreground">
          Select a conversation
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Choose a contact from the sidebar to read recent messages or start a
          real-time thread.
        </p>
      </div>
    </section>
  );
};

export default NoChatSelected;
