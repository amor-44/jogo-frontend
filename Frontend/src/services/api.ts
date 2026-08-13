import axios, { AxiosError } from 'axios';
import type { AuthResponseDto, RefreshCommand } from '../types';

// ─── Arabic Error Messages ────────────────────────────────────────────────────

const HTTP_STATUS_ARABIC: Record<number, string> = {
  400: 'البيانات المرسلة غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.',
  401: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  403: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
  404: 'المورد المطلوب غير موجود.',
  408: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.',
  409: 'يوجد تعارض في البيانات. ربما هذا العنصر موجود بالفعل.',
  413: 'حجم الملف كبير جداً. يرجى تقليل الحجم والمحاولة مرة أخرى.',
  422: 'البيانات المدخلة غير صالحة. يرجى مراجعة الحقول والمحاولة مرة أخرى.',
  429: 'تم إرسال طلبات كثيرة. يرجى الانتظار قليلاً والمحاولة مرة أخرى.',
  500: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
  502: 'الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.',
  503: 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
};

/**
 * Extract a user-friendly Arabic error message from an Axios error.
 * Falls back to a generic message if nothing specific is available.
 */
export function getArabicErrorMessage(error: unknown): string {
  if (!error) return 'حدث خطأ غير متوقع.';

  if (axios.isAxiosError(error)) {
    const axErr = error as AxiosError<{ detail?: string; title?: string; message?: string; errors?: Record<string, string[]> }>;
    const status = axErr.response?.status;
    const data = axErr.response?.data;

    // Try to extract server-provided detail first
    if (data) {
      if (typeof data === 'string') return data;
      if (data.detail) return data.detail;
      if (data.title) return data.title;
      if (data.message) return data.message;
      if (data.errors) {
        const allErrors = Object.values(data.errors).flat();
        if (allErrors.length > 0) return allErrors.join(' • ');
      }
    }

    // Fall back to status-based Arabic message
    if (status && HTTP_STATUS_ARABIC[status]) {
      return HTTP_STATUS_ARABIC[status];
    }

    // Network error
    if (axErr.code === 'ERR_NETWORK' || !axErr.response) {
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
    }

    if (axErr.code === 'ECONNABORTED') {
      return 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
    }
  }

  if (error instanceof Error) {
    return error.message || 'حدث خطأ غير متوقع.';
  }

  return 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
}

const rawUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://jogofootball.runasp.net/api/v1';
const BASE_URL = rawUrl.replaceAll('[', '').replaceAll(']', '').trim();
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefresh = localStorage.getItem('refreshToken');

      if (!storedRefresh) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const payload: RefreshCommand = { refreshToken: storedRefresh };
        const { data } = await axios.post<AuthResponseDto>(
          `${BASE_URL}/auth/refresh`,
          payload
        );

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);