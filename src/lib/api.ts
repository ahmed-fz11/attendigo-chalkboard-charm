const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : "https://web-production-166aa.up.railway.app";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_REACT_APP_API_BASE_URL ??
  DEFAULT_API_BASE_URL;

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export interface ApiStudent {
  id: string;
  class_id: string;
  full_name: string;
  parent_phone: string;
  active: boolean;
}

export interface ApiClass {
  id: string;
  name: string;
  teacher_user_id: string;
  students: ApiStudent[];
}

export interface CreateClassPayload {
  name: string;
  teacher_user_id: string;
  students?: Array<{
    full_name: string;
    parent_phone: string;
  }>;
}

export interface CreateClassResponse {
  message: string;
  class_id: string;
  students_added: number;
}

export interface UpdateClassPayload {
  name?: string;
  teacher_user_id?: string;
  students?: Array<{
    id?: string;
    full_name: string;
    parent_phone: string;
    active?: boolean;
  }>;
  new_students?: Array<{
    full_name: string;
    parent_phone: string;
  }>;
}

export interface UpdateClassResponse {
  message: string;
  class: {
    id: string;
    name: string;
    teacher_user_id: string;
  };
  students_added?: number;
  new_students?: ApiStudent[];
}

export interface DeleteClassResponse {
  message: string;
  class_id: string;
}

export interface TeacherClassesResponse {
  classes: ApiClass[];
}

export interface AttendanceRecordPayload {
  class_id: string;
  marked_by: string;
  date: string;
  records: Array<{
    student_id: string;
    status: "present" | "absent";
    note?: string | null;
  }>;
}

export interface AttendanceRecordResponse {
  message: string;
  records_saved: number;
  records: Array<{
    class_id: string;
    student_id: string;
    date: string;
    status: "present" | "absent";
    note: string | null;
    marked_by: string;
  }>;
}

export interface ReportSummaryPayload {
  class_id: string;
  period: "weekly" | "monthly";
}

export interface ReportSummaryResponse {
  class_id: string;
  class_name: string;
  period: "weekly" | "monthly";
  from_date: string;
  to_date: string;
  average_attendance_percent: number;
  total_absences: number;
  students_flagged: number;
  records_total: number;
}

export interface DailyReportPayload {
  class_id: string;
  days?: number;
}

export interface DailyReportResponse {
  class_id: string;
  days: number;
  logs: Array<{
    date: string;
    class_name: string;
    attendance_percent: number;
  }>;
}

interface ApiRequestConfig {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const buildUrl = (path: string): string => {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

const apiRequest = async <T>(
  path: string,
  { method = "GET", body, headers, signal }: ApiRequestConfig = {},
): Promise<T> => {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && body !== null) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    signal,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message: unknown = null;
    if (typeof payload === "object" && payload !== null) {
      if ("message" in payload) {
        message = (payload as Record<string, unknown>).message;
      } else if ("error" in payload) {
        message = (payload as Record<string, unknown>).error;
      }
    }

    if (typeof message !== "string" || message.length === 0) {
      message = response.statusText || "Request failed";
    }

    throw new Error(message);
  }

  return payload as T;
};

export const fetchTeacherClasses = async (
  teacherUserId: string,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<TeacherClassesResponse> =>
  apiRequest<TeacherClassesResponse>(`/teacher/${teacherUserId}/classes`, {
    ...config,
    method: "GET",
  });

export const createClass = async (
  payload: CreateClassPayload,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<CreateClassResponse> =>
  apiRequest<CreateClassResponse>("/class/add", {
    ...config,
    method: "POST",
    body: payload,
  });

export const updateClass = async (
  classId: string,
  payload: UpdateClassPayload,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<UpdateClassResponse> =>
  apiRequest<UpdateClassResponse>(`/class/${classId}`, {
    ...config,
    method: "PUT",
    body: payload,
  });

export const removeClass = async (
  classId: string,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<DeleteClassResponse> =>
  apiRequest<DeleteClassResponse>(`/class/${classId}`, {
    ...config,
    method: "DELETE",
  });

export const submitAttendance = async (
  payload: AttendanceRecordPayload,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<AttendanceRecordResponse> =>
  apiRequest<AttendanceRecordResponse>("/attendance/take", {
    ...config,
    method: "POST",
    body: payload,
  });

export const fetchReportSummary = async (
  payload: ReportSummaryPayload,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<ReportSummaryResponse> =>
  apiRequest<ReportSummaryResponse>("/report/summary", {
    ...config,
    method: "POST",
    body: payload,
  });

export const fetchDailyReport = async (
  payload: DailyReportPayload,
  config?: Omit<ApiRequestConfig, "method" | "body">,
): Promise<DailyReportResponse> =>
  apiRequest<DailyReportResponse>("/report/daily", {
    ...config,
    method: "POST",
    body: payload,
  });
