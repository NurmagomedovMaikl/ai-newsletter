import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-layout";

export const metadata: Metadata = { title: "AGB" };

export default function TermsPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen (AGB)" updated="07.08.2026">
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung des Onlinedienstes
        „AI Newsletter“ (nachfolgend „Dienst“), angeboten von Maik Löwen, Hahnenfeldstr. 12b,
        32427 Minden (nachfolgend „Anbieter“), über die Website
        https://ai-newsletter-sage.vercel.app.
      </p>

      <h2>2. Vertragsgegenstand</h2>
      <p>
        Der Anbieter stellt einen wöchentlichen Newsletter mit Informationen rund um künstliche
        Intelligenz bereit. Der Dienst umfasst ein kostenloses Angebot („Free“) sowie ein
        kostenpflichtiges Abonnement („Paid“) mit zusätzlichen Inhalten. Teile der Inhalte werden
        automatisiert mithilfe von künstlicher Intelligenz erstellt.
      </p>

      <h2>3. Zustandekommen des Vertrags</h2>
      <ol>
        <li>
          Die Registrierung für den Free-Dienst erfolgt über das Online-Formular. Mit Absenden der
          Registrierung und Bestätigung der E-Mail-Adresse kommt ein Vertrag über den Free-Dienst
          zustande.
        </li>
        <li>
          Das Paid-Abonnement kommt über den Zahlungsanbieter Lemon Squeezy zustande. Mit Abschluss
          des Bestellvorgangs und erfolgreicher Zahlungsbestätigung kommt der Vertrag über das
          Paid-Abonnement zustande.
        </li>
      </ol>

      <h2>4. Preise und Zahlung</h2>
      <p>
        Die Preise für das Paid-Abonnement ergeben sich aus der Preisangabe zum Zeitpunkt des
        Bestellvorgangs (monatliche Zahlungsweise). Zahlungen werden über Lemon Squeezy abgewickelt.
        Der Anbieter ist nicht Teil des Zahlungsvorgangs als Zahlungsempfänger im Sinne des
        Zahlungsverkehrs; Transaktionen werden durch Lemon Squeezy als Merchant of Record
        abgewickelt.
      </p>

      <h2>5. Laufzeit und Kündigung</h2>
      <ol>
        <li>
          Das Paid-Abonnement läuft über die jeweils gebuchte Laufzeit (monatlich) und verlängert
          sich automatisch, sofern nicht rechtzeitig gekündigt wird.
        </li>
        <li>
          Die Kündigung kann jederzeit über den Kündigungslink in der E-Mail, über das Kundenportal
          von Lemon Squeezy oder durch E-Mail an den Anbieter erklärt werden. Sie wirkt zum Ende der
          aktuellen Abrechnungsperiode.
        </li>
        <li>
          Der Free-Dienst kann jederzeit durch Löschung des Kontos oder Abbestellen des Newsletters
          beendet werden.
        </li>
      </ol>

      <h2>6. Widerrufsrecht für Verbraucher</h2>
      <p>
        Verbrauchern steht das gesetzliche Widerrufsrecht zu. Der Widerruf kann innerhalb von 14
        Tagen ab Vertragsschluss ohne Angabe von Gründen erklärt werden. Bei digitalen Inhalten, die
        sofort geliefert werden, erlischt das Widerrufsrecht, sobald Sie ausdrücklich zugestimmt
        haben, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung des Vertrags beginnen, und
        Sie Ihre Kenntnis davon bestätigt haben, dass Sie mit dem Verlust des Widerrufsrechts
        einverstanden sind.
      </p>

      <h2>7. Haftung</h2>
      <ol>
        <li>
          Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
          Verletzung von Leben, Körper und Gesundheit.
        </li>
        <li>
          Für einfache Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher
          Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen,
          vorhersehbaren Schaden.
        </li>
        <li>
          Die Haftung nach dem Produkthaftungsgesetz sowie bei arglistigem Verschweigen von Mängeln
          bleibt unberührt.
        </li>
        <li>
          Inhalte des Newsletters werden automatisiert erstellt. Der Anbieter übernimmt keine
          Gewähr für die inhaltliche Richtigkeit, Vollständigkeit und Aktualität der Inhalte.
          Weitere Hinweise siehe Disclaimer.
        </li>
      </ol>

      <h2>8. Änderungen der AGB</h2>
      <p>
        Der Anbieter kann diese AGB anpassen, soweit dies angemessen ist und das Vertragsverhältnis
        nicht einseitig zu Ihrem Nachteil verändert. Wesentliche Änderungen werden Ihnen rechtzeitig
        vor Inkrafttreten mitgeteilt. Kündigen Sie nicht innerhalb von einem Monat nach Mitteilung,
        gelten die geänderten AGB als angenommen.
      </p>

      <h2>9. Anwendbares Recht und Gerichtsstand</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Ist die
        Nutzerin bzw. der Nutzer Verbraucher, bleibt die zwingende Anwendbarkeit des Rechts des
        Staates, in dem sie bzw. er ihren bzw. seinen gewöhnlichen Aufenthalt hat, unberührt. Für
        Klagen des Anbieters gegen Kaufleute ist Minden Gerichtsstand.
      </p>

      <h2>10. Streitschlichtung</h2>
      <p>
        Hinweis auf die EU-Plattform zur Online-Streitbeilegung:{" "}
        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
          https://ec.europa.eu/consumers/odr/
        </a>
        .
      </p>
    </LegalPage>
  );
}
