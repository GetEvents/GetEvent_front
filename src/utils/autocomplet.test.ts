import { beforeEach, describe, expect, it, vi } from "vitest";
import { initMapAuto } from "./autocomplet";

describe("initMapAuto", () => {
  let listeners: Record<string, Array<() => void>>;
  let autocomplete: any;
  let marker: any;
  let map: any;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="maps"></div><input id="pac_input" /><div id="pac_card"></div>
      <div id="infowindow-content"><b id="place-name"></b><span id="place-address"></span></div>
      <button id="changetype-all"></button><button id="changetype-address"></button>
      <button id="changetype-establishment"></button><button id="changetype-geocode"></button>
      <button id="changetype-cities"></button><button id="changetype-regions"></button>`;
    listeners = {};
    map = {
      controls: { TOP_LEFT: { push: vi.fn() } },
      fitBounds: vi.fn(),
      setCenter: vi.fn(),
      setZoom: vi.fn(),
    };
    autocomplete = {
      addListener: vi.fn((name, cb) => (listeners[name] ||= []).push(cb)),
      bindTo: vi.fn(),
      setTypes: vi.fn(),
      getPlace: vi.fn(() => ({
        name: "Palais des congres",
        formatted_address: "Cotonou, Benin",
        geometry: { location: { lat: 1, lng: 2 }, viewport: {} },
      })),
    };
    marker = { map: null, position: null };
    const infowindow = { setContent: vi.fn(), close: vi.fn(), open: vi.fn() };
    vi.stubGlobal("google", {
      maps: {
        Map: vi.fn(function () {
          return map;
        }),
        ControlPosition: { TOP_LEFT: "TOP_LEFT" },
        places: {
          Autocomplete: vi.fn(function () {
            return autocomplete;
          }),
        },
        InfoWindow: vi.fn(function () {
          return infowindow;
        }),
        marker: {
          AdvancedMarkerElement: vi.fn(function () {
            return marker;
          }),
        },
      },
    });
  });

  it("ne fait rien si les elements requis manquent", () => {
    document.body.innerHTML = "";
    expect(() => initMapAuto(vi.fn())).not.toThrow();
  });

  it("configure la carte et reporte le lieu selectionne", () => {
    const setForm = vi.fn((updater) => updater({ location: "" }));
    initMapAuto(setForm);
    listeners.place_changed.forEach((listener) => listener());
    expect(setForm).toHaveBeenCalled();
    expect(
      (document.querySelector("#pac_input") as HTMLInputElement).value,
    ).toBe("Cotonou, Benin");
    expect(map.fitBounds).toHaveBeenCalled();
    expect(marker.position).toEqual({ lat: 1, lng: 2 });
    expect(marker.map).toBe(map);
    expect(document.querySelector("#place-name")?.textContent).toBe(
      "Palais des congres",
    );
    expect(document.querySelector("#place-address")?.textContent).toBe(
      "Cotonou, Benin",
    );
  });

  it("configure les filtres de type", () => {
    initMapAuto(vi.fn());
    document.querySelector<HTMLButtonElement>("#changetype-address")?.click();
    document.querySelector<HTMLButtonElement>("#changetype-cities")?.click();
    expect(autocomplete.setTypes).toHaveBeenCalledWith(["address"]);
    expect(autocomplete.setTypes).toHaveBeenCalledWith(["(cities)"]);
  });

  it("alerte quand le lieu ne possede pas de geometrie", () => {
    const alert = vi.fn();
    vi.stubGlobal("alert", alert);
    autocomplete.getPlace.mockReturnValue({ name: "Lieu inconnu" });
    initMapAuto(vi.fn());
    listeners.place_changed[1]();
    expect(alert).toHaveBeenCalledWith(expect.stringContaining("Lieu inconnu"));
  });
});
