export async function fetchJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data: unknown = await response.json();
  return data as T;
}
