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

  it("enveloppe l'autocomplete dans un conteneur visuellement aligné sur les autres champs", () => {
    initMapAuto(vi.fn());

    const wrapper = document.querySelector(
      "[data-autocomplete-wrapper='location-form']",
    );

    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain("form-control");
    const styles = wrapper?.getAttribute("style") ?? "";
    expect(styles).toContain("border: 1px solid");
    expect(styles).toContain("background-color: rgb(255, 255, 255)");
  });

  it("injecte des styles pour supprimer le contour de focus du composant Google", () => {
    initMapAuto(vi.fn());

    const style = document.querySelector("style[data-autocomplete-styles]");

    expect(style).not.toBeNull();
    expect(style?.textContent).toContain("::part(focus-ring)");
    expect(style?.textContent).toContain("display: none");
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
