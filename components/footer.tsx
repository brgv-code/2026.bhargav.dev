import { ArchiveDropdown } from "@/components/archive-dropdown";

export function Footer() {
  return (
    <footer className="py-16 mt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ArchiveDropdown />
        <p className="text-xs text-muted-foreground/70">
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
