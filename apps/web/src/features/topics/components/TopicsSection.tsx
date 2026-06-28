import type { ReactNode } from "react";
import { Download, Plus } from "lucide-react";
import { HelpTooltip } from "@/components/HelpTooltip";
import { DateRangePicker } from "@/features/calendar/components/DateRangePicker";
import type { DateRangeValue } from "@/features/calendar/lib/calendar-utils";
import { Button } from "@/components/ui/button";
import { ToolbarSectionGroup } from "@/components/ToolbarSectionGroup";
import { cn } from "@/lib/utils";

type TopicsSectionProps = {
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
  onClearDateRange: () => void;
  onAddTopic: () => void;
  children: ReactNode;
  empty?: ReactNode;
  className?: string;
  onExport?: () => void;
  exportDisabled?: boolean;
  presentation?: boolean;
};

export function TopicsSection({
  dateRange,
  onDateRangeChange,
  onClearDateRange,
  onAddTopic,
  children,
  empty,
  className,
  onExport,
  exportDisabled = false,
  presentation = false,
}: TopicsSectionProps) {
  const isEmpty = empty != null;

  return (
    <section
      className={cn(
        presentation
          ? "overflow-hidden"
          : "rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <header
        className={cn(
          "relative z-20 flex flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
          presentation ? "bg-background" : "bg-muted/25",
        )}
      >
        <div className="flex items-center gap-1">
          <h2
            className={cn(
              "font-semibold tracking-tight",
              presentation ? "text-base" : "text-sm",
            )}
          >
            Темы
          </h2>
          {!presentation ? (
            <HelpTooltip text="В Excel это (Название видео / контента)" />
          ) : null}
        </div>

        <ToolbarSectionGroup className="bg-transparent">
          <DateRangePicker
            size="sm"
            showPresets
            value={dateRange}
            onChange={onDateRangeChange}
            onClear={onClearDateRange}
          />

          {onExport ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5"
              disabled={exportDisabled}
              onClick={onExport}
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
          ) : null}

          {!presentation ? (
            <Button size="sm" className="h-8 px-2.5" onClick={onAddTopic}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Новая тема</span>
            </Button>
          ) : null}
        </ToolbarSectionGroup>
      </header>

      <div
        className={cn(
          "flex flex-col gap-2",
          presentation ? "p-0" : "p-2.5 sm:p-3",
        )}
      >
        {isEmpty ? empty : children}
      </div>
    </section>
  );
}
