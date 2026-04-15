import { CalculationResult } from "./calculations";

const HISTORY_KEY = "pneumaflow_history";
const EMAIL_KEY = "pneumaflow_email";

export function getEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}

export function setEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email);
}

export function isUnlocked(): boolean {
  return !!getEmail();
}

export function getHistory(): CalculationResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
  } catch {
    return [];
  }
}

export function addToHistory(result: CalculationResult): void {
  const history = getHistory();
  history.unshift(result);
  if (history.length > 100) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
