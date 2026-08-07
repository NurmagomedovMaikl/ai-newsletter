import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-layout";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer" updated="07.08.2026">
      <h2>Inhalte des Newsletters</h2>
      <p>
        Die im Rahmen des Dienstes bereitgestellten Inhalte, insbesondere die wöchentlichen
        Newsletter-Ausgaben, werden teilweise automatisiert mit Hilfe künstlicher Intelligenz
        erstellt. Sie dienen ausschließlich der allgemeinen Information und stellen keine
        Anlageberatung, Rechts-, Steuer- oder sonstige fachliche Beratung dar.
      </p>
      <p>
        Wir bemühen uns, aktuelle und korrekte Informationen bereitzustellen, übernehmen jedoch
        keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität der Inhalte. Insbesondere kann
        nicht ausgeschlossen werden, dass KI-generierte Inhalte ungenau, veraltet oder fehlerhaft
        sind. Jede Nutzung der Inhalte erfolgt auf eigene Verantwortung.
      </p>

      <h2>Externe Links</h2>
      <p>
        Der Newsletter und die Website enthalten Verweise (Links) auf externe Websites Dritter. Auf
        die Inhalte dieser externen Seiten haben wir keinen Einfluss. Für die Inhalte der
        verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich. Eine dauerhafte Kontrolle
        der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
        zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
        entfernen.
      </p>

      <h2>Empfehlungen und Produktverweise</h2>
      <p>
        Empfehlungen von Tools, Podcasts, Videos und Artikeln (z. B. „Tool of the Week“, „Podcast of
        the Week“) sind redaktionelle Hinweise und keine verbindlichen Kauf- oder Nutzungsempfehlungen.
        Für die Funktionsfähigkeit, Verfügbarkeit und rechtmäßige Nutzung der empfohlenen Produkte
        und Dienste Dritter wird keine Haftung übernommen.
      </p>

      <h2>Haftung</h2>
      <p>
        Ansprüche auf Schadensersatz sind ausgeschlossen, soweit nicht Vorsatz oder grobe
        Fahrlässigkeit vorliegt, Leben, Körper oder Gesundheit verletzt wurden oder zwingende
        gesetzliche Bestimmungen entgegenstehen. Die vorstehende Haftungsbegrenzung gilt
        entsprechend für Erfüllungsgehilfen.
      </p>
    </LegalPage>
  );
}
