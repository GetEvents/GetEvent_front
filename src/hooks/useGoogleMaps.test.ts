import { beforeEach, describe, expect, it, vi } from "vitest";

describe("loadGoogleMapsApi", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
    vi.stubGlobal("google", undefined);
    vi.stubGlobal("process", {
      env: { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "test-key" },
    });
  });

  it("partage une seule promesse et charge places et marker une seule fois", async () => {
    const { loadGoogleMapsApi } = await import("./useGoogleMaps");
    const firstLoad = loadGoogleMapsApi(["places"]);
    const secondLoad = loadGoogleMapsApi(["marker"]);
    const scripts = document.querySelectorAll<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );

    expect(firstLoad).toBe(secondLoad);
    expect(scripts).toHaveLength(1);

    const scriptUrl = new URL(scripts[0].src);
    expect(scriptUrl.searchParams.get("loading")).toBe("async");
    expect(scriptUrl.searchParams.get("libraries")).toBe("marker,places");

    vi.stubGlobal("google", {
      maps: {
        Map: vi.fn(),
        marker: { AdvancedMarkerElement: vi.fn() },
        places: { PlaceAutocompleteElement: vi.fn() },
      },
    });
    (
      window as typeof window & { __getEventGoogleMapsReady?: () => void }
    ).__getEventGoogleMapsReady?.();

    await Promise.all([firstLoad, secondLoad]);
  });

  it("ne recharge pas le script lorsque l'API complète est déjà prête", async () => {
    vi.stubGlobal("google", {
      maps: {
        Map: vi.fn(),
        marker: { AdvancedMarkerElement: vi.fn() },
        places: { PlaceAutocompleteElement: vi.fn() },
      },
    });
    const { loadGoogleMapsApi } = await import("./useGoogleMaps");

    await loadGoogleMapsApi();

    expect(
      document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]'),
    ).toBeNull();
  });
});
