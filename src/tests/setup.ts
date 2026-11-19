import { afterEach, vi } from "vitest";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds = [];
  private readonly observerCallback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.observerCallback = callback;
  }

  disconnect() {}
  observe(target: Element) {
    this.observerCallback(
      [
        {
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: 1,
          intersectionRect: target.getBoundingClientRect(),
          isIntersecting: true,
          rootBounds: null,
          target,
          time: Date.now(),
        },
      ],
      this,
    );
  }
  takeRecords() {
    return [];
  }
  unobserve() {}
}

globalThis.IntersectionObserver = IntersectionObserverMock;

// next/font/google n'existe qu'au build Next.js : sous Vitest, chaque police
// renvoie une classe et une variable CSS vides.
// Exports explicites (pas de Proxy : un Proxy répond aussi à « then » et
// Vitest prendrait le module pour une promesse).
vi.mock("next/font/google", () => {
  const font = () => ({ className: "", variable: "", style: {} });
  return { Archivo: font, Geist: font, Geist_Mono: font };
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});
