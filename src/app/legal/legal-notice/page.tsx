import type { Metadata } from "next";
import { LegalPage, legalStyles as styles } from "../LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales | GetEvent",
  description: "Informations légales relatives à la plateforme GetEvent.",
};

export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Mentions légales"
      lead="Les informations d’identification, de publication et d’hébergement de la plateforme GetEvent."
    >
      <div className={styles.warning} role="note">
        <strong>À finaliser avant la mise en production :</strong> les champs
        surlignés ci-dessous ne peuvent pas être déduits du code source. Ils
        doivent être remplacés par les informations administratives exactes de
        l’éditeur et de l’hébergeur du site web.
      </div>

      <section className={styles.section}>
        <h2>1. Éditeur de la plateforme</h2>
        <p>
          La plateforme <strong>GetEvent</strong> est éditée par Marcelin
          Tingougoui.
        </p>
        <ul>
          <li>
            Forme ou statut juridique :{" "}
            <span className={styles.placeholder}>à compléter</span>
          </li>
          <li>
            Adresse professionnelle :{" "}
            <span className={styles.placeholder}>à compléter</span>
          </li>
          <li>
            Numéro RCCM / IFU, le cas échéant :{" "}
            <span className={styles.placeholder}>à compléter</span>
          </li>
          <li>
            Téléphone : <span className={styles.placeholder}>à compléter</span>
          </li>
          <li>
            E-mail :{" "}
            <a href="mailto:contact@getevent.com">contact@getevent.com</a>
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>2. Direction de la publication</h2>
        <p>
          Le directeur de la publication est{" "}
          <strong>Marcelin Tingougoui</strong>. Il peut être contacté à
          l’adresse{" "}
          <a href="mailto:contact@getevent.com">contact@getevent.com</a>.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Hébergement et prestataires techniques</h2>
        <p>
          Hébergeur de l’interface web :{" "}
          <span className={styles.placeholder}>
            nom, raison sociale et adresse à confirmer
          </span>
          .
        </p>
        <p>
          L’API GetEvent est actuellement déployée au moyen de services fournis
          par <strong>Render</strong>. Les images sont stockées au moyen de
          <strong> Cloudinary</strong>. Des services de paiement de
          <strong> Stripe</strong> et <strong>FedaPay</strong> peuvent être
          utilisés selon le pays et le type de transaction.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Propriété intellectuelle</h2>
        <p>
          La structure, l’identité visuelle, les textes, éléments graphiques,
          logiciels et bases de données propres à GetEvent sont protégés par les
          règles applicables à la propriété intellectuelle. Toute reproduction,
          adaptation ou exploitation non autorisée est interdite, sauf exception
          prévue par la loi ou autorisation écrite préalable.
        </p>
        <p>
          Les organisateurs restent titulaires des droits sur les contenus
          qu’ils publient et garantissent disposer des autorisations nécessaires
          à leur diffusion sur GetEvent.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Droit applicable et contact</h2>
        <p>
          La plateforme est soumise au droit de la République du Bénin,
          notamment à la loi n° 2017-20 du 20 avril 2018 portant Code du
          numérique, telle que modifiée par la loi n° 2020-35 du 6 janvier 2021.
          Pour toute question ou signalement, écrivez à{" "}
          <a href="mailto:contact@getevent.com">contact@getevent.com</a>.
        </p>
        <p>
          Textes officiels :{" "}
          <a
            href="https://sgg.gouv.bj/doc/loi-2017-20/"
            target="_blank"
            rel="noreferrer"
          >
            Code du numérique
          </a>{" "}
          et{" "}
          <a
            href="https://sgg.gouv.bj/doc/loi-2020-35/"
            target="_blank"
            rel="noreferrer"
          >
            loi modificative n° 2020-35
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
