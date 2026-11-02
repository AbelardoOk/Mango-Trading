export const ONBOARDING_KEY = "mango-onboarding-v1";

export type OnboardingState = {
  dismissed?: boolean;
  market?: boolean;
  wallet?: boolean;
  ranking?: boolean;
};

export function readOnboarding(): OnboardingState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "{}") as OnboardingState;
  } catch {
    return {};
  }
}

export function markOnboarding(step: keyof Omit<OnboardingState, "dismissed">) {
  if (typeof window === "undefined") return;
  const current = readOnboarding();
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...current, [step]: true }));
  window.dispatchEvent(new Event("mango:onboarding"));
}

export function dismissOnboarding() {
  if (typeof window === "undefined") return;
  const current = readOnboarding();
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...current, dismissed: true }));
  window.dispatchEvent(new Event("mango:onboarding"));
}
