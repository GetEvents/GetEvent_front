import type { Metadata } from "next";
import { LegalPage, legalStyles as styles } from "../LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation | GetEvent",
  description: "Règles d’utilisation de la plateforme GetEvent.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPage
      title="Conditions d’utilisation"
      lead="Les règles qui encadrent la création d’un compte, l’organisation d’événements, les inscriptions, la messagerie et les paiements sur GetEvent."
    >
      <section className={styles.section}>
        <h2>1. Objet et acceptation</h2>
        <p>
          GetEvent permet de créer, publier et gérer des événements, de s’y
          inscrire, d’échanger avec les participants, d’émettre des billets et,
          selon les cas, de traiter des paiements. L’utilisation d’un compte
          vaut acceptation des présentes conditions. La politique de
          confidentialité en fait partie intégrante.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Accès et compte</h2>
        <p>
          L’utilisateur fournit des informations exactes et les maintient à
          jour. Il protège ses identifiants, ne partage pas son compte et
          avertit GetEvent de tout accès suspect. L’inscription est réservée aux
          personnes capables de contracter ; un mineur doit agir avec
          l’autorisation de son représentant légal.
        </p>
        <p>
          GetEvent peut demander une vérification raisonnable et suspendre un
          compte en cas d’informations manifestement fausses, d’usage frauduleux
          ou de risque pour la sécurité.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Obligations des organisateurs</h2>
        <p>L’organisateur est seul responsable :</p>
        <ul>
          <li>
            de la réalité, de la légalité et du bon déroulement de son événement
            ;
          </li>
          <li>
            de l’exactitude du prix, des dates, du lieu, de la capacité, des
            conditions d’accès et de remboursement annoncées ;
          </li>
          <li>
            des autorisations administratives, assurances, licences et droits de
            propriété intellectuelle nécessaires ;
          </li>
          <li>
            de l’information des participants en cas de modification, report ou
            annulation ;
          </li>
          <li>
            de l’usage licite et confidentiel des informations auxquelles il
            accède sur ses participants.
          </li>
        </ul>
        <p>
          GetEvent fournit un outil technique et n’est ni l’organisateur ni le
          vendeur de l’événement, sauf indication expresse contraire.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Inscriptions, billets et contrôle d’accès</h2>
        <p>
          Une inscription n’est confirmée qu’après validation affichée par la
          plateforme et, pour un événement payant, confirmation du paiement. Le
          billet et son QR code sont personnels. Leur copie, revente non
          autorisée ou utilisation frauduleuse peut entraîner leur annulation.
        </p>
        <p>
          Les conditions particulières annoncées par l’organisateur complètent
          les présentes conditions, à condition de ne pas leur être contraires.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Paiements et remboursements</h2>
        <p>
          Les paiements sont exécutés par Stripe ou FedaPay. Leurs propres
          conditions peuvent s’appliquer. GetEvent ne conserve pas les données
          complètes de carte bancaire. Les prix et devises sont affichés avant
          la confirmation de l’opération.
        </p>
        <p>
          Sauf obligation légale contraire, les règles d’annulation et de
          remboursement sont fixées et mises en œuvre par l’organisateur. En cas
          de contestation, l’utilisateur doit d’abord le contacter ; GetEvent
          peut fournir les éléments techniques dont il dispose sans garantir
          l’issue du remboursement.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Contenus et comportements interdits</h2>
        <p>Il est interdit d’utiliser GetEvent pour :</p>
        <ul>
          <li>
            publier un événement, message ou contenu illégal, trompeur, haineux,
            violent ou portant atteinte aux droits d’autrui ;
          </li>
          <li>
            harceler un utilisateur, usurper une identité ou collecter des
            données sans droit ;
          </li>
          <li>
            contourner la sécurité, perturber le service, introduire un
            programme malveillant ou automatiser des accès abusifs ;
          </li>
          <li>
            organiser une fraude, un paiement illicite ou une activité interdite
            par la réglementation béninoise.
          </li>
        </ul>
        <p>
          L’utilisateur accorde à GetEvent une autorisation non exclusive,
          limitée au fonctionnement et à la promotion de l’événement concerné,
          pour héberger et afficher les contenus qu’il publie. Il en conserve la
          propriété.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Modération, suspension et suppression</h2>
        <p>
          GetEvent peut retirer un contenu, limiter une fonctionnalité,
          invalider un billet ou suspendre un compte lorsque cela est
          raisonnablement nécessaire pour faire respecter les présentes
          conditions, protéger les utilisateurs, répondre à une autorité
          compétente ou sécuriser la plateforme. Sauf urgence ou interdiction
          légale, l’utilisateur est informé du motif et peut présenter ses
          observations.
        </p>
        <p>
          L’utilisateur peut supprimer son compte depuis le service. Certaines
          données peuvent être conservées lorsqu’une obligation légale ou un
          litige en cours l’exige.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Disponibilité et responsabilité</h2>
        <p>
          GetEvent s’efforce d’assurer un service disponible et sécurisé, sans
          garantir une absence totale d’interruption ou d’erreur. Une
          maintenance, une panne de réseau, un prestataire tiers ou un événement
          de force majeure peut affecter temporairement la plateforme.
        </p>
        <p>
          GetEvent répond de ses propres manquements dans les limites autorisées
          par la loi. Il ne répond pas de l’exécution de l’événement par
          l’organisateur, des contenus publiés par les utilisateurs ni d’un
          dommage causé exclusivement par un tiers ou par l’usage fautif de
          l’utilisateur. Aucune clause ne limite un droit auquel la loi interdit
          de renoncer.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Modification des conditions</h2>
        <p>
          GetEvent peut adapter ces conditions à l’évolution du service ou de la
          réglementation. Une modification importante est portée à la
          connaissance des utilisateurs dans un délai raisonnable. La version et
          sa date sont accessibles sur cette page.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. Droit applicable et règlement des différends</h2>
        <p>
          Les présentes conditions sont régies par le droit béninois. Avant
          toute action, les parties s’efforcent de résoudre leur différend à
          l’amiable en écrivant à{" "}
          <a href="mailto:contact@getevent.com">contact@getevent.com</a>. À
          défaut d’accord, les juridictions matériellement et territorialement
          compétentes sont saisies conformément aux règles applicables.
        </p>
      </section>
    </LegalPage>
  );
}
