import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import attendigoBg1 from "@/assets/attendigo_bg1.png";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  fetchDailyReport,
  fetchReportSummary,
  fetchTeacherClasses,
  type ApiClass,
  type DailyReportResponse,
  type ReportSummaryResponse,
} from "@/lib/api";
import { Download, Clock, Calendar, Loader2 } from "lucide-react";

type ReportRange = "weekly" | "monthly";

const formatDateLabel = (value: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const rangeToDays = (range: ReportRange) => (range === "weekly" ? 7 : 30);

const Reports = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const teacherId = user?.id ?? null;

  const [reportRange, setReportRange] = useState<ReportRange>("weekly");
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [summary, setSummary] = useState<ReportSummaryResponse | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyReportResponse["logs"]>([]);

  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [classesError, setClassesError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [logsError, setLogsError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  const loadClasses = useCallback(async (): Promise<ApiClass[]> => {
    if (!teacherId) {
      return [];
    }

    setIsLoadingClasses(true);
    setClassesError(null);

    try {
      const data = await fetchTeacherClasses(teacherId);
      const classList = data.classes ?? [];
      setClasses(classList);
      return classList;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load classes.";
      setClasses([]);
      setClassesError(message);
      toast({
        title: "Unable to fetch classes",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingClasses(false);
    }
  }, [teacherId]);

  const loadSummary = useCallback(
    async (classId: string, period: ReportRange) => {
      if (!classId) {
        setSummary(null);
        return;
      }

      setIsLoadingSummary(true);
      setSummaryError(null);

      try {
        const data = await fetchReportSummary({
          class_id: classId,
          period,
        });
        setSummary(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load summary data.";
        setSummary(null);
        setSummaryError(message);
        toast({
          title: "Unable to load summary",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingSummary(false);
      }
    },
    [],
  );

  const loadDailyLogs = useCallback(
    async (classId: string, period: ReportRange) => {
      if (!classId) {
        setDailyLogs([]);
        return;
      }

      setIsLoadingLogs(true);
      setLogsError(null);

      try {
        const data = await fetchDailyReport({
          class_id: classId,
          days: rangeToDays(period),
        });
        setDailyLogs(data.logs ?? []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load daily logs.";
        setDailyLogs([]);
        setLogsError(message);
        toast({
          title: "Unable to load daily logs",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoadingLogs(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!teacherId) {
      setClasses([]);
      setSelectedClassId("");
      setSummary(null);
      setDailyLogs([]);
      return;
    }

    loadClasses();
  }, [authLoading, teacherId, loadClasses]);

  useEffect(() => {
    if (classes.length === 0) {
      setSelectedClassId("");
      setSummary(null);
      setDailyLogs([]);
      return;
    }

    setSelectedClassId((current) => {
      if (current && classes.some((cls) => cls.id === current)) {
        return current;
      }
      return classes[0].id;
    });
  }, [classes]);

  useEffect(() => {
    if (!selectedClassId) {
      setSummary(null);
      setDailyLogs([]);
      return;
    }

    loadSummary(selectedClassId, reportRange);
    loadDailyLogs(selectedClassId, reportRange);
  }, [selectedClassId, reportRange, loadSummary, loadDailyLogs]);

  const selectedClassName = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId)?.name ?? "",
    [classes, selectedClassId],
  );

  const summaryCards = useMemo(() => {
    const average =
      summary && typeof summary.average_attendance_percent === "number"
        ? `${Math.round(summary.average_attendance_percent)}%`
        : "--";
    const totalAbsences =
      summary && typeof summary.total_absences === "number"
        ? `${summary.total_absences}`
        : "--";
    const flagged =
      summary && typeof summary.students_flagged === "number"
        ? `${summary.students_flagged}`
        : "--";
    const recordsDetail =
      summary && typeof summary.records_total === "number"
        ? `${summary.records_total} records`
        : undefined;

    const absencesSubtitle = summary
      ? reportRange === "weekly"
        ? "This week"
        : "This month"
      : undefined;

    return [
      {
        title: "Average Attendance",
        value: average,
        icon: "👥",
        bgColor: "bg-accent-blue/20 border-accent-blue/30",
        subtitle: summary ? `Class: ${summary.class_name}` : undefined,
      },
      {
        title: "Absences",
        value: totalAbsences,
        icon: "📅",
        bgColor: "bg-accent-yellow/20 border-accent-yellow/30",
        subtitle: absencesSubtitle,
      },
      {
        title: "Students flagged",
        value: flagged,
        icon: "⚠️",
        bgColor: "bg-accent-orange/20 border-accent-orange/30",
        subtitle: recordsDetail,
      },
    ];
  }, [summary, reportRange]);

  const aiInsights = [
    {
      icon: <Clock className="w-5 h-5 text-accent-orange" />,
      text: "Late arrivals spike on Mondays",
    },
    {
      icon: <Calendar className="w-5 h-5 text-accent-blue" />,
      text: "Absences higher on holidays",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${attendigoBg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-preference",
      }}
    >
      <Navbar showAttendanceButton onLogout={handleLogout} />

      <div className="container mx-auto space-y-6 p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Main Reports Section */}
          <div className="space-y-6 lg:col-span-3">
            <Card className="backdrop-blur-sm bg-card/95 shadow-lg">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-2xl text-primary">Reports</CardTitle>
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <span className="text-sm text-muted-foreground">Range</span>
                  <Select value={reportRange} onValueChange={(value) => setReportRange(value as ReportRange)}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {classesError && (
                  <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {classesError}
                  </div>
                )}

                {summaryError && (
                  <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {summaryError}
                  </div>
                )}

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {summaryCards.map((item, index) => (
                    <Card key={index} className={`${item.bgColor} border`}>
                      <CardContent className="p-4 text-center">
                        <div className="mb-2 text-2xl">{item.icon}</div>
                        <div className="mb-1 flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                          {isLoadingSummary ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            item.value
                          )}
                        </div>
                        <div className="text-sm text-foreground">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {summary && (
                  <p className="mb-6 text-sm text-muted-foreground">
                    Reporting window: {formatDateLabel(summary.from_date)} –{" "}
                    {formatDateLabel(summary.to_date)}
                  </p>
                )}

                {/* Daily Logs Table */}
                <div>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xl font-semibold text-primary">Daily Logs</h3>
                    <Select
                      value={selectedClassId}
                      onValueChange={setSelectedClassId}
                      disabled={classes.length === 0 || isLoadingClasses}
                    >
                      <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue
                          placeholder={
                            isLoadingClasses ? "Loading classes..." : "Select class"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classInfo) => (
                          <SelectItem key={classInfo.id} value={classInfo.id}>
                            {classInfo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <div className="grid grid-cols-3 gap-4 rounded-t-lg bg-muted/50 p-4 font-semibold text-primary">
                        <div>Date</div>
                        <div>Class</div>
                        <div>Attendance %</div>
                      </div>
                      {isLoadingLogs ? (
                        <div className="border-b p-6 text-center text-sm text-muted-foreground">
                          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
                          Loading daily logs...
                        </div>
                      ) : logsError ? (
                        <div className="border-b p-6 text-center text-sm text-destructive">
                          {logsError}
                        </div>
                      ) : dailyLogs.length === 0 ? (
                        <div className="border-b p-6 text-center text-sm text-muted-foreground">
                          No attendance logs found for the selected range.
                        </div>
                      ) : (
                        dailyLogs.map((log, index) => (
                          <div
                            key={log.date}
                            className={`grid grid-cols-3 gap-4 border-b p-4 ${
                              index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                            }`}
                          >
                            <div className="font-medium">{formatDateLabel(log.date)}</div>
                            <div>{log.class_name ?? selectedClassName}</div>
                            <div className="font-semibold text-primary">
                              {`${log.attendance_percent}%`}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/95 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-primary">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                    {insight.icon}
                    <span className="text-sm">{insight.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Download Buttons */}
            <div className="space-y-3">
              <Button variant="secondary" className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
