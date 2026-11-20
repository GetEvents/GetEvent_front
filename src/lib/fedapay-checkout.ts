// Paiement FedaPay sans quitter le site, via le widget Checkout.js.
// Le backend crée la transaction (montant, métadonnées, ligne en base) et
// renvoie son id : le widget s'ouvre directement sur cette transaction.
// Repli : la page de paiement hébergée par FedaPay (paymentUrl), si la clé
// publique n'est pas configurée ou si le script ne se charge pas.

const SCRIPT_SRC = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
const SCRIPT_TIMEOUT = 10000;

// Next.js remplace ces variables à la compilation ; hors Next (tests dans le
// navigateur), `process` n'existe pas, d'où la lecture protégée.
const readEnv = (read: () => string | undefined) => {
  try {
    return read();
  } catch {
    return undefined;
  }
};

const PUBLIC_KEY = readEnv(() => process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY);
const ENVIRONMENT =
  readEnv(() => process.env.NEXT_PUBLIC_FEDAPAY_ENVIRONMENT) === "live"
    ? "live"
    : "sandbox";
const API_URL =
  readEnv(() => process.env.NEXT_PUBLIC_API_ENDPOINT) ||
  "http://localhost:3001";

type CompleteHandler = (
  // eslint-disable-next-line no-unused-vars
  response: { reason?: unknown; transaction?: unknown } | unknown,
  // eslint-disable-next-line no-unused-vars
  transaction?: unknown,
) => void;

type FedaPayGlobal = {
  CHECKOUT_COMPLETED: unknown;
  DIALOG_DISMISSED: unknown;
  // eslint-disable-next-line no-unused-vars
  init: (options: Record<string, unknown>) => { open: () => void };
};

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    FedaPay?: FedaPayGlobal;
  }
}

export type CheckoutOutcome = "completed" | "dismissed" | "redirected";

export type PaymentSession = {
  paymentUrl?: string;
  paymentTransactionId?: number | string;
};

let scriptPromise: Promise<FedaPayGlobal> | null = null;

/** Charge Checkout.js une seule fois (rejette après un délai). */
function loadCheckoutScript(): Promise<FedaPayGlobal> {
  if (window.FedaPay) return Promise.resolve(window.FedaPay);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<FedaPayGlobal>((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(
      () => reject(new Error("Checkout.js indisponible")),
      SCRIPT_TIMEOUT,
    );
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.FedaPay) resolve(window.FedaPay);
      else reject(new Error("Checkout.js indisponible"));
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("Checkout.js indisponible"));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    // Permet de réessayer au prochain achat.
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

/** URL du retour backend : il vérifie la transaction, crée les billets puis
 *  redirige vers /participations/callback (même parcours que la page hébergée). */
export function fedapayReturnUrl(transactionId: number | string) {
  return `${API_URL}/api/payments/fedapay/callback?id=${encodeURIComponent(
    String(transactionId),
  )}`;
}

/**
 * Ouvre le paiement FedaPay : dans `container` (élément de notre page, pour
 * l'habiller aux couleurs du site) ou, à défaut, dans la fenêtre de FedaPay.
 * - "completed" : paiement terminé, le navigateur part vers le retour backend ;
 * - "dismissed" : l'utilisateur a fermé la fenêtre sans payer ;
 * - "redirected" : repli sur la page hébergée FedaPay.
 */
export async function openFedaPayCheckout(
  session: PaymentSession,
  {
    publicKey = PUBLIC_KEY,
    navigate = (url: string) => window.location.assign(url),
    container,
  }: {
    publicKey?: string;
    container?: HTMLElement | null;
    // eslint-disable-next-line no-unused-vars
    navigate?: (url: string) => void;
  } = {},
): Promise<CheckoutOutcome> {
  const { paymentUrl, paymentTransactionId } = session;

  const redirect = (): CheckoutOutcome => {
    if (paymentUrl) navigate(paymentUrl);
    return "redirected";
  };

  if (!publicKey || !paymentTransactionId) return redirect();

  let FedaPay: FedaPayGlobal;
  try {
    FedaPay = await loadCheckoutScript();
  } catch {
    return redirect();
  }

  return new Promise<CheckoutOutcome>((resolve) => {
    // Selon la version du script, la raison arrive seule ou dans un objet.
    const onComplete: CompleteHandler = (response) => {
      const reason =
        response && typeof response === "object" && "reason" in response
          ? (response as { reason?: unknown }).reason
          : response;

      if (reason === FedaPay.CHECKOUT_COMPLETED) {
        navigate(fedapayReturnUrl(paymentTransactionId));
        resolve("completed");
      } else {
        resolve("dismissed");
      }
    };

    try {
      const widget = FedaPay.init({
        public_key: publicKey,
        environment: ENVIRONMENT,
        locale: "fr",
        transaction: { id: Number(paymentTransactionId) },
        onComplete,
        // Intégré : le formulaire s'affiche tout de suite dans le conteneur.
        ...(container ? { container } : {}),
      });
      if (!container) widget.open();
    } catch {
      resolve(redirect());
    }
  });
}
