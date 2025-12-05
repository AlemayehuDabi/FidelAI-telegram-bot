/**
 * Simple in-memory state management for user sessions
 * In production, you might want to use a database or Redis
 */

interface UserState {
  mode?: "explain" | "question";
  grade?: number;
  subject?: string;
  topic?: string;
  lastExplanation?: string;
  waitingForQuestion?: boolean;
  navigationStack?: Array<{ type: string; data: any }>;
}

const userStates = new Map<number, UserState>();

export function getUserState(userId: number): UserState {
  if (!userStates.has(userId)) {
    userStates.set(userId, {});
  }
  return userStates.get(userId)!;
}

export function setUserState(userId: number, state: Partial<UserState>): void {
  const current = getUserState(userId);
  userStates.set(userId, { ...current, ...state });
}

export function clearUserState(userId: number): void {
  userStates.delete(userId);
}

export function pushNavigation(userId: number, type: string, data: any): void {
  const state = getUserState(userId);
  if (!state.navigationStack) {
    state.navigationStack = [];
  }
  state.navigationStack.push({ type, data });
}

export function popNavigation(userId: number): { type: string; data: any } | null {
  const state = getUserState(userId);
  if (!state.navigationStack || state.navigationStack.length === 0) {
    return null;
  }
  return state.navigationStack.pop()!;
}

