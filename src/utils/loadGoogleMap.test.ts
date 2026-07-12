import { beforeEach, describe, expect, it, vi } from "vitest";

describe("loadGoogleMapsScript", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
    vi.stubGlobal("process", {
      env: { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "test-key" },
    });
  });

  it("cree un seul script et execute toutes les callbacks", async () => {
    const { loadGoogleMapsScript } = await import("./loadGoogleMap");
    const first = vi.fn();
    const second = vi.fn();
    loadGoogleMapsScript(first);
    loadGoogleMapsScript(second);
    const script = document.querySelector<HTMLScriptElement>(
      "#google-maps-script",
    );
    expect(script?.src).toContain("key=test-key");
    expect(document.querySelectorAll("#google-maps-script")).toHaveLength(1);
    script?.onload?.(new Event("load"));
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("ne charge rien sans cle API", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "";
    const { loadGoogleMapsScript } = await import("./loadGoogleMap");
    loadGoogleMapsScript(vi.fn());
    expect(document.querySelector("#google-maps-script")).toBeNull();
  });
});
