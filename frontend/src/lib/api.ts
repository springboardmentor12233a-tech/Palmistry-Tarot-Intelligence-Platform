import {
  AuthResponse,
  FullReading,
  NotificationItem,
  PalmAnalysisResult,
  ReadingHistoryItem,
  SpreadType,
  TarotDrawResult,
  User,
} from '@/types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const apiPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  return API_BASE ? `${API_BASE}${apiPath}` : apiPath;
}

class ApiClient {
  private static instance: ApiClient;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Don't set Content-Type if FormData
    if (options.body instanceof FormData) {
      delete defaultHeaders['Content-Type'];
    }

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
      credentials: 'include', // Important: sends httpOnly cookies
    };

    const targetUrl = buildUrl(url);

    try {
      const response = await fetch(targetUrl, mergedOptions);

      if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
        // Attempt silent refresh
        const refreshed = await this.silentRefresh();
        if (refreshed) {
          return this.fetchWithAuth<T>(url, options);
        } else {
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?session_expired=true';
          }
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (!response.ok) {
        let errorMsg = `Request failed (${response.status})`;
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errData.message || errorMsg;
        } catch {
          // fallback to status text
        }
        throw new Error(errorMsg);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      throw err;
    }
  }

  private async silentRefresh(): Promise<boolean> {
    try {
      const res = await fetch(buildUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Auth Endpoints
  async register(data: {
    name: string;
    email: string;
    password?: string;
    age_group?: string;
    interests?: string[];
    spiritual_goals?: string[];
  }): Promise<AuthResponse> {
    return this.fetchWithAuth<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password?: string }): Promise<AuthResponse> {
    return this.fetchWithAuth<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.fetchWithAuth<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  }

  // User Endpoints
  async getMe(): Promise<User> {
    return this.fetchWithAuth<User>('/api/users/me');
  }

  async updateMe(data: Partial<User>): Promise<User> {
    return this.fetchWithAuth<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getMyReadings(): Promise<ReadingHistoryItem[]> {
    return this.fetchWithAuth<ReadingHistoryItem[]>('/api/users/me/readings');
  }

  // Palm Analysis
  async analyzePalm(formData: FormData): Promise<PalmAnalysisResult> {
    return this.fetchWithAuth<PalmAnalysisResult>('/api/palm/analyze', {
      method: 'POST',
      body: formData,
    });
  }

  // Tarot Draw
  async drawTarot(spread_type: SpreadType, seed?: string): Promise<TarotDrawResult> {
    return this.fetchWithAuth<TarotDrawResult>('/api/tarot/draw', {
      method: 'POST',
      body: JSON.stringify({ spread_type, seed }),
    });
  }

  // Reading Generation
  async generateReading(data: {
    palm_result: PalmAnalysisResult;
    tarot_spread: TarotDrawResult;
    user_context?: {
      focus_topic?: string;
      specific_question?: string;
    };
  }): Promise<FullReading> {
    return this.fetchWithAuth<FullReading>('/api/reading/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReadingById(id: string): Promise<FullReading> {
    return this.fetchWithAuth<FullReading>(`/api/reading/${id}`);
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.fetchWithAuth<NotificationItem[]>('/api/notifications');
  }

  // Export Download URL
  getExportUrl(id: string, format: 'pdf' | 'xlsx'): string {
    return buildUrl(`/api/reading/${id}/export?format=${format}`);
  }
}

export const api = ApiClient.getInstance();
