import type { Metadata } from "next";
import { LegalPage, legalStyles as styles } from "../LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité | GetEvent",
  description: "Comment GetEvent collecte, utilise et protège vos données.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      lead="Cette politique explique, en langage clair, quelles données GetEvent utilise, pourquoi elles sont nécessaires et comment exercer vos droits."
    >
      <section className={styles.section}>
        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable des traitements réalisés pour exploiter GetEvent est
          l’éditeur identifié dans les mentions légales. Les demandes relatives
          aux données personnelles peuvent être adressées à{" "}
          <a href="mailto:contact@getevent.com">contact@getevent.com</a>.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Données traitées et finalités</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Données</th>
                <th>Pourquoi</th>
                <th>Fondement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Nom, prénom, e-mail, photo, date de naissance, pays, téléphone
                  et rôle
                </td>
                <td>
                  Créer et gérer le compte, vérifier l’identité fonctionnelle et
                  contacter l’utilisateur
                </td>
                <td>Exécution du service demandé</td>
              </tr>
              <tr>
                <td>Identifiants Google, si cette connexion est choisie</td>
                <td>
                  Authentifier l’utilisateur sans créer un autre mot de passe
                </td>
                <td>Choix de l’utilisateur et exécution du service</td>
              </tr>
              <tr>
                <td>
                  Événements, inscriptions, messages, notifications et billets
                  avec QR code
                </td>
                <td>
                  Organiser les événements, permettre les échanges et contrôler
                  l’accès
                </td>
                <td>Exécution du service</td>
              </tr>
              <tr>
                <td>
                  Montant, devise, statut, prestataire et références de
                  transaction
                </td>
                <td>
                  Traiter le paiement, reverser les organisateurs, prévenir la
                  fraude et tenir les justificatifs
                </td>
                <td>Exécution du service et obligations légales</td>
              </tr>
              <tr>
                <td>
                  Adresse IP, pays estimé, journaux techniques et données de
                  session
                </td>
                <td>
                  Sécuriser la plateforme, diagnostiquer les incidents et
                  adapter certains services
                </td>
                <td>Sécurité et intérêt légitime de GetEvent</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          GetEvent ne reçoit pas le numéro complet de votre carte bancaire : il
          est traité directement par le prestataire de paiement choisi.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Caractère obligatoire</h2>
        <p>
          Les champs signalés comme obligatoires sont nécessaires à la création
          du compte ou à l’utilisation de la fonctionnalité demandée. Sans eux,
          GetEvent peut ne pas être en mesure de fournir le service. Le pays et
          le téléphone sont notamment requis pour certains comptes organisateurs
          et services de paiement.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Destinataires et prestataires</h2>
        <p>
          Dans la limite nécessaire à leurs missions, les données peuvent être
          accessibles :
        </p>
        <ul>
          <li>à l’équipe habilitée de GetEvent ;</li>
          <li>
            aux organisateurs pour gérer leurs événements et participants ;
          </li>
          <li>à Stripe ou FedaPay pour les paiements et reversements ;</li>
          <li>à Cloudinary pour l’hébergement des images ;</li>
          <li>
            à Google pour la connexion choisie et les fonctions cartographiques
            ;
          </li>
          <li>
            aux fournisseurs d’hébergement, de base de données, d’e-mail et de
            supervision technique ;
          </li>
          <li>aux autorités habilitées lorsqu’une règle de droit l’impose.</li>
        </ul>
        <p>
          Des données de profil ou de participation sont aussi visibles par les
          membres de l’événement lorsque cela est nécessaire à la messagerie et
          à l’organisation collective.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Transferts internationaux</h2>
        <p>
          Certains prestataires sont établis ou hébergent des données hors du
          Bénin. GetEvent sélectionne des prestataires présentant des garanties
          de sécurité et encadre les transferts conformément aux exigences du
          Code du numérique béninois. Des informations sur les garanties
          applicables peuvent être demandées à l’adresse de contact.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Durées de conservation</h2>
        <ul>
          <li>
            Compte et profil : pendant la vie du compte, puis le temps
            nécessaire à sa suppression technique et au traitement d’un éventuel
            litige.
          </li>
          <li>
            Événements, messages, notifications et billets : pendant la durée
            utile au service, puis archivage ou suppression selon les besoins de
            preuve et les obligations applicables.
          </li>
          <li>
            Transactions et pièces justificatives : pendant la durée imposée par
            les règles comptables, fiscales et de lutte contre la fraude.
          </li>
          <li>
            Jeton de session : 15 minutes ; jeton de renouvellement : au plus 30
            jours, sauf révocation anticipée.
          </li>
          <li>
            Journaux de sécurité : pour une durée limitée, proportionnée à la
            détection et à l’analyse des incidents.
          </li>
        </ul>
        <p>
          Ces durées peuvent être prolongées lorsqu’une conservation est requise
          pour respecter la loi, établir une preuve ou défendre un droit.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Cookies et stockage local</h2>
        <p>
          GetEvent utilise des cookies de session strictement nécessaires à
          l’authentification et à la sécurité. Ils sont configurés pour ne pas
          être accessibles au JavaScript du navigateur et, en production, pour
          être transmis par une connexion sécurisée. Le cookie de renouvellement
          peut être conservé jusqu’à 30 jours.
        </p>
        <p>
          Les services cartographiques ou de connexion Google peuvent déposer
          leurs propres traceurs lorsque vous utilisez ces fonctions. Si
          GetEvent ajoute des outils de mesure d’audience, de publicité ou
          d’autres traceurs non essentiels, un mécanisme de choix préalable
          devra être présenté.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Vos droits</h2>
        <p>
          Dans les conditions prévues par le Code du numérique béninois, vous
          pouvez demander l’accès à vos données, leur rectification, leur mise à
          jour ou leur suppression, et vous opposer à certains traitements. Vous
          pouvez aussi retirer votre consentement lorsqu’un traitement repose
          sur celui-ci, sans affecter les opérations déjà licitement réalisées.
        </p>
        <p>
          Envoyez votre demande à{" "}
          <a href="mailto:contact@getevent.com">contact@getevent.com</a> en
          précisant le droit exercé. Une preuve d’identité peut être demandée en
          cas de doute raisonnable. Vous pouvez également saisir l’Autorité de
          Protection des Données à caractère Personnel du Bénin (APDP).
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Sécurité et évolution</h2>
        <p>
          GetEvent applique des mesures techniques et organisationnelles
          adaptées, notamment le chiffrement des mots de passe, des cookies de
          session protégés, des contrôles d’accès et la révocation des sessions.
          Aucun système n’étant infaillible, tout incident suspect peut être
          signalé à l’adresse de contact.
        </p>
        <p>
          Cette politique peut évoluer avec la plateforme ou la réglementation.
          La date de mise à jour figurant en tête de page permet d’identifier la
          version applicable.
        </p>
      </section>
    </LegalPage>
  );
}
