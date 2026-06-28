import { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { Download, Loader2, Plus, Search } from "lucide-react";

import { HelpTooltip } from "@/components/HelpTooltip";

import { DateRangePicker } from "@/features/calendar/components/DateRangePicker";

import { EMPTY_DATE_RANGE } from "@/features/calendar/lib/calendar-utils";

import { useDashboardTopicsContext } from "@/features/dashboard/DashboardTopicsProvider";
import { useDashboardShell } from "@/features/dashboard/DashboardShellContext";

import {
  DASHBOARD_NAV,
  pageSubtitleKey,
  pageTitleKey,
} from "@/features/dashboard/lib/nav";

import { AddTopicDialog } from "@/features/topics/components/AddTopicDialog";

import { FirstTopicEmptyState } from "@/features/topics/components/FirstTopicEmptyState";

import { TopicsList } from "@/features/topics/components/TopicsList";

import {
  filterTopics,
  flattenFilteredTopicsPublications,
  formatTopicsFilterPeriod,
} from "@/features/topics/lib/topic-filters";

import { exportTopicsStatsToExcel } from "@/features/export/export-topics-stats";
import { PresentationModeToggle } from "@/features/presentation/PresentationModeToggle";
import { ViewModeDateRangePicker } from "@/features/presentation/ViewModeDateRangePicker";
import { usePresentationMode } from "@/features/presentation/PresentationModeContext";

import { Button } from "@/components/ui/button";
import { ToolbarSectionGroup } from "@/components/ToolbarSectionGroup";
import { Input } from "@/components/ui/input";

export function TopicsPage() {
  const { t } = useTranslation();
  const { isPresentationMode } = usePresentationMode();

  const {
    sourceTopics,
    isLoading,
    isError,
    refetch,
    handleCreateTopic,
    isCreatingTopic,
  } = useDashboardTopicsContext();
  const { subscriberSources } = useDashboardShell();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [dateRange, setDateRange] = useState(EMPTY_DATE_RANGE);

  const hasTopics = sourceTopics.length > 0;

  const pageTitle = t(pageTitleKey(DASHBOARD_NAV.topics));

  const pageSubtitle = t(pageSubtitleKey(DASHBOARD_NAV.topics));

  const filters = useMemo(
    () => ({ query, dateRange }),

    [query, dateRange],
  );

  const filteredTopics = useMemo(
    () => filterTopics(sourceTopics, filters),

    [sourceTopics, filters],
  );

  const exportRows = useMemo(
    () =>
      flattenFilteredTopicsPublications(
        filteredTopics,
        filters,
        subscriberSources,
      ),

    [filteredTopics, filters, subscriberSources],
  );

  const periodLabel = formatTopicsFilterPeriod(dateRange);

  const handleExport = () => {
    void exportTopicsStatsToExcel(exportRows, {
      periodLabel: dateRange.enabled ? periodLabel : undefined,
    });
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-1">
            <h1
              className={
                isPresentationMode
                  ? "text-2xl font-semibold tracking-tight"
                  : "text-xl font-semibold tracking-tight"
              }
            >
              {pageTitle}
            </h1>
            {!isPresentationMode ? (
              <HelpTooltip text="В Excel это (Название видео / контента)" />
            ) : null}
          </div>

          {!isPresentationMode ? (
            <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
          ) : dateRange.enabled ? (
            <p className="text-sm text-muted-foreground">
              Период: {periodLabel}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PresentationModeToggle />

          {!isPresentationMode ? (
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                className="pl-9"
                placeholder="Поиск по теме или публикации…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!hasTopics}
              />
            </div>
          ) : null}

          <ToolbarSectionGroup>
            {isPresentationMode ? (
              <ViewModeDateRangePicker
                value={dateRange}
                onChange={setDateRange}
                onClear={() => setDateRange(EMPTY_DATE_RANGE)}
              />
            ) : (
              <DateRangePicker
                showPresets
                value={dateRange}
                onChange={setDateRange}
                onClear={() => setDateRange(EMPTY_DATE_RANGE)}
              />
            )}

            <Button
              variant="outline"
              disabled={exportRows.length === 0}
              onClick={handleExport}
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>

            {!isPresentationMode ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="size-4" />
                <span className="hidden sm:inline">Новая тема</span>
              </Button>
            ) : null}
          </ToolbarSectionGroup>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-6 md:px-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : isError ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground shadow-sm">
            <p>{t("dashboard.emptyTopics.loadError")}</p>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() => void refetch()}
            >
              {t("dashboard.emptyTopics.retry")}
            </Button>
          </section>
        ) : !hasTopics ? (
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <FirstTopicEmptyState onCreateTopic={() => setDialogOpen(true)} />
          </section>
        ) : filteredTopics.length === 0 ? (
          <section className="overflow-hidden rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground shadow-sm">
            {dateRange.enabled
              ? `Нет тем за ${periodLabel}${query ? ` по запросу «${query}»` : ""}`
              : `Ничего не найдено по запросу «${query}»`}
          </section>
        ) : (
          <section
            className={
              isPresentationMode
                ? "overflow-hidden"
                : "overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm sm:p-2.5"
            }
          >
            <TopicsList
              topics={filteredTopics}
              filters={filters}
              compact={!isPresentationMode}
              presentation={isPresentationMode}
              subscriberSources={subscriberSources}
            />
          </section>
        )}
      </main>

      <AddTopicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateTopic}
        isSubmitting={isCreatingTopic}
      />
    </>
  );
}
