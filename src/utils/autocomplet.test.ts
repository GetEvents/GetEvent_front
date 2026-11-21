import { beforeEach, describe, expect, it, vi } from "vitest";
import { initMapAuto } from "./autocomplet";

describe("initMapAuto", () => {
  let autocomplete: HTMLElement & { value: string; placeholder: string };
  let marker: any;
  let map: any;
  let place: any;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="maps"></div><input id="pac_input" />
      <div id="infowindow-content"><b id="place-name"></b><span id="place-address"></span></div>`;
    map = {
      fitBounds: vi.fn(),
      setCenter: vi.fn(),
      setZoom: vi.fn(),
    };
    autocomplete = Object.assign(document.createElement("div"), {
      value: "",
      placeholder: "",
    });
    place = {
      displayName: "Palais des congres",
      formattedAddress: "Cotonou, Benin",
      location: { lat: 1, lng: 2 },
      viewport: {},
      fetchFields: vi.fn().mockResolvedValue(undefined),
    };
    marker = { map: null, position: null };
    const infowindow = { setContent: vi.fn(), close: vi.fn(), open: vi.fn() };
    vi.stubGlobal("google", {
      maps: {
        Map: vi.fn(function () {
          return map;
        }),
        places: {
          PlaceAutocompleteElement: vi.fn(function () {
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

  it("configure la carte et reporte le lieu selectionne", async () => {
    const setForm = vi.fn((updater) => updater({ location: "" }));
    initMapAuto(setForm);
    const event = new Event("gmp-select") as Event & { placePrediction: any };
    event.placePrediction = { toPlace: () => place };
    autocomplete.dispatchEvent(event);
    await vi.waitFor(() => expect(place.fetchFields).toHaveBeenCalled());

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

  it("synchronise la saisie manuelle", () => {
    const setForm = vi.fn((updater) => updater({ location: "" }));
    initMapAuto(setForm);
    autocomplete.value = "Porto-Novo";
    autocomplete.dispatchEvent(new Event("input"));
    expect(setForm).toHaveBeenCalled();
    expect(
      (document.querySelector("#pac_input") as HTMLInputElement).value,
    ).toBe("Porto-Novo");
  });

  it("enveloppe l'autocomplete dans un conteneur aligné sur les autres champs", () => {
    initMapAuto(vi.fn());

    const wrapper = document.querySelector(
      "[data-autocomplete-wrapper='location-form']",
    );
    const style = document.getElementById("getevent-place-autocomplete-styles");

    expect(wrapper).not.toBeNull();
    // Même habillage que les champs du site (mixin « field ») : bordure,
    // hauteur, focus.
    expect(style?.textContent).toContain(
      "[data-autocomplete-wrapper='location-form']",
    );
    expect(style?.textContent).toContain(
      "border: 1px solid rgba(17, 17, 19, 0.2)",
    );
    expect(style?.textContent).toContain(":focus-within");
  });

  it("injecte une seule fois les styles qui masquent le contour Google", () => {
    initMapAuto(vi.fn());
    initMapAuto(vi.fn());

    const styles = document.querySelectorAll(
      "#getevent-place-autocomplete-styles",
    );

    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain("::part(focus-ring)");
    expect(styles[0].textContent).toContain("display: none");
  });

  it("ne laisse pas de cadre en double quand l'étape est rouverte", () => {
    const cleanup = initMapAuto(vi.fn());
    initMapAuto(vi.fn());

    expect(
      document.querySelectorAll("[data-autocomplete-wrapper]"),
    ).toHaveLength(1);

    cleanup?.();
  });

  it("alerte quand le lieu ne possede pas de position", async () => {
    const alert = vi.fn();
    vi.stubGlobal("alert", alert);
    place.location = null;
    place.displayName = "Lieu inconnu";
    initMapAuto(vi.fn());
    const event = new Event("gmp-select") as Event & { placePrediction: any };
    event.placePrediction = { toPlace: () => place };
    autocomplete.dispatchEvent(event);
    await vi.waitFor(() => expect(alert).toHaveBeenCalled());
    expect(alert).toHaveBeenCalledWith(expect.stringContaining("Lieu inconnu"));
  });
});
