import { afterEach, describe, expect, it, vi } from "vitest";
import { fedapayReturnUrl, openFedaPayCheckout } from "./fedapay-checkout";

const COMPLETED = "completed-reason";
const DISMISSED = "dismissed-reason";

// Faux Checkout.js : init() garde les options, open() ferme la fenêtre avec
// la raison donnée (sous forme d'objet, comme le script récent).
function mockFedaPay(reason: unknown) {
  const init = vi.fn((options: Record<string, any>) => ({
    open: () => options.onComplete({ reason, transaction: {} }),
  }));
  window.FedaPay = {
    CHECKOUT_COMPLETED: COMPLETED,
    DIALOG_DISMISSED: DISMISSED,
    init,
  };
  return init;
}

const RETURN_URL = "https://api.test/api/payments/fedapay/callback/signature";

const session = {
  paymentUrl: "https://pay.test/hosted",
  paymentTransactionId: 42,
  paymentReturnUrl: RETURN_URL,
};

describe("openFedaPayCheckout", () => {
  afterEach(() => {
    delete window.FedaPay;
  });

  it("se replie sur la page hébergée sans clé publique", async () => {
    const navigate = vi.fn();
    await expect(
      openFedaPayCheckout(session, { publicKey: "", navigate }),
    ).resolves.toBe("redirected");
    expect(navigate).toHaveBeenCalledWith("https://pay.test/hosted");
  });

  it("se replie sur la page hébergée sans id de transaction", async () => {
    const navigate = vi.fn();
    await expect(
      openFedaPayCheckout(
        { paymentUrl: "https://pay.test/hosted" },
        { publicKey: "pk_sandbox_x", navigate },
      ),
    ).resolves.toBe("redirected");
    expect(navigate).toHaveBeenCalledWith("https://pay.test/hosted");
  });

  it("ouvre le widget sur la transaction et part vers le retour backend après paiement", async () => {
    const init = mockFedaPay(COMPLETED);
    const navigate = vi.fn();
    await expect(
      openFedaPayCheckout(session, { publicKey: "pk_sandbox_x", navigate }),
    ).resolves.toBe("completed");
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        public_key: "pk_sandbox_x",
        transaction: { id: 42 },
      }),
    );
    expect(navigate).toHaveBeenCalledWith(`${RETURN_URL}?id=42`);
    expect(fedapayReturnUrl(RETURN_URL, 42)).toBe(`${RETURN_URL}?id=42`);
  });

  it("se replie sur la page hébergée sans URL de retour signée", async () => {
    const init = mockFedaPay(COMPLETED);
    const navigate = vi.fn();
    await expect(
      openFedaPayCheckout(
        { paymentUrl: "https://pay.test/hosted", paymentTransactionId: 42 },
        { publicKey: "pk_sandbox_x", navigate },
      ),
    ).resolves.toBe("redirected");
    expect(init).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("https://pay.test/hosted");
  });

  it("affiche le formulaire dans le conteneur fourni, sans ouvrir la fenêtre FedaPay", async () => {
    const open = vi.fn();
    const init = vi.fn((options: Record<string, any>) => {
      // En mode intégré, FedaPay signale la fin via onComplete.
      queueMicrotask(() =>
        options.onComplete({ reason: DISMISSED, transaction: {} }),
      );
      return { open };
    });
    window.FedaPay = {
      CHECKOUT_COMPLETED: COMPLETED,
      DIALOG_DISMISSED: DISMISSED,
      init,
    };
    const container = document.createElement("div");

    await expect(
      openFedaPayCheckout(session, {
        publicKey: "pk_sandbox_x",
        navigate: vi.fn(),
        container,
      }),
    ).resolves.toBe("dismissed");
    expect(init).toHaveBeenCalledWith(expect.objectContaining({ container }));
    expect(open).not.toHaveBeenCalled();
  });

  it("ne navigue pas si l'utilisateur ferme la fenêtre", async () => {
    mockFedaPay(DISMISSED);
    const navigate = vi.fn();
    await expect(
      openFedaPayCheckout(session, { publicKey: "pk_sandbox_x", navigate }),
    ).resolves.toBe("dismissed");
    expect(navigate).not.toHaveBeenCalled();
  });
});
