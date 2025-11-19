export type AxiosRequestConfig = {
  baseURL?: string;
  headers?: Record<string, string>;
};

export type AxiosResponse<T = unknown> = {
  data: T;
  status: number;
};

export class AxiosError<T = unknown> extends Error {
  response?: AxiosResponse<T>;

  constructor(message: string, response?: AxiosResponse<T>) {
    super(message);
    this.name = 'AxiosError';
    this.response = response;
  }
}

export type AxiosInstance = {
  defaults: { headers: { common: Record<string, string> } };
  baseURL?: string;
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  create: (config?: AxiosRequestConfig) => AxiosInstance;
};

const buildUrl = (instanceBase: string | undefined, url: string) => {
  if (!instanceBase) return url;
  if (url.startsWith('http')) return url;
  return `${instanceBase}${url}`;
};

const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const defaults = { headers: { common: {} as Record<string, string> } };

  const request = async <T>(method: string, url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const fullUrl = buildUrl(baseURL, url);
    const headers = {
      'Content-Type': 'application/json',
      ...defaults.headers.common,
      ...(config?.headers ?? {}),
    };

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });

    let parsed: unknown = null;
    try {
      parsed = await response.json();
    } catch (error) {
      parsed = null;
    }

    const axiosResponse: AxiosResponse<T> = {
      data: parsed as T,
      status: response.status,
    };

    if (!response.ok) {
      throw new AxiosError('Request failed', axiosResponse);
    }

    return axiosResponse;
  };

  const instance: AxiosInstance = {
    defaults,
    baseURL,
    get: (url, config) => request('GET', url, undefined, config),
    post: (url, data, config) => request('POST', url, data, config),
    create: (config) => createAxiosInstance(config?.baseURL ?? baseURL),
  };

  return instance;
};

const axios = createAxiosInstance();

export default axios;
