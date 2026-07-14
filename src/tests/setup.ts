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

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});
