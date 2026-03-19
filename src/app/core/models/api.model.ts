/**
 * Generic paginated list response from Frisbii API.
 */
export interface ApiList<T> {
  count: number;
  next_page_token?: string;
  content: T[];
}

/**
 * Standard API error structure.
 */
export interface ApiError {
  http_status: number;
  code: string;
  message: string;
  request_id?: string;
}
