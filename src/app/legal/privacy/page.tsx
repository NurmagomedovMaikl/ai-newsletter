import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-layout";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Datenschutzerklärung" updated="07.08.2026">
      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO):
        <br />
        [Vorname Nachname]
        <br />
        [Straße, Hausnummer]
        <br />
        [PLZ Ort]
        <br />
        E-Mail: [E-Mail-Adresse]
      </p>

      <h2>2. Überblick über die Datenverarbeitung</h2>
      <p>
        Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unseres
        Newsletters und der zugehörigen Funktionen erforderlich ist. Rechtsgrundlagen sind je nach
        Verarbeitung Art. 6 Abs. 1 lit. a (Einwilligung), lit. b (Vertrag) und lit. f (berechtigtes
        Interesse) DSGVO.
      </p>

      <h2>3. Registrierung und Konto</h2>
      <p>Bei der Registrierung erheben wir:</p>
      <ul>
        <li>E-Mail-Adresse</li>
        <li>Vor- und Nachname (optional)</li>
        <li>Passwort (verschlüsselt gespeichert)</li>
        <li>Zeitpunkt der Registrierung und der E-Mail-Bestätigung</li>
      </ul>
      <p>
        Diese Daten sind erforderlich, um Ihnen den Newsletter zuzustellen und Ihnen den Zugriff auf
        Ihre Kontodaten zu ermöglichen (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2>4. E-Mail-Versand und Newsletter-Tracking</h2>
      <p>
        Der Versand unserer Newsletter-E-Mails erfolgt über den Dienstleister{" "}
        <a href="https://resend.com" target="_blank" rel="noreferrer">Resend</a>{" "}
        (Resend Inc., 2794 Gateway Road, Carlsbad, CA 92009, USA). Zu diesem Zweck werden
        E-Mail-Adresse und ausgewählte Zustellmetadaten an Resend übermittelt. Resend ist nach dem
        EU-US-Datenrahmen (EU-US Data Privacy Framework) zertifiziert.
      </p>
      <p>
        Unsere E-Mails enthalten teilweise Zählpixel. Diese ermöglichen uns zu erkennen, ob und wann
        eine E-Mail geöffnet wurde und ob Links angeklickt wurden. Diese Daten dienen der Auswertung
        des Nutzungsverhaltens und der Verbesserung des Newsletters (Art. 6 Abs. 1 lit. f DSGVO). Sie
        können dem Tracking jederzeit widersprechen, indem Sie den Newsletter abbestellen.
      </p>

      <h2>5. Zahlungsabwicklung</h2>
      <p>
        Für bezahlte Abonnements nutzen wir{" "}
        <a href="https://www.lemonsqueezy.com" target="_blank" rel="noreferrer">Lemon Squeezy</a>{" "}
        (Lemon Squeezy, LLC, USA) als Zahlungsdienstleister. Die für die Zahlungsabwicklung
        erforderlichen Daten (Name, E-Mail-Adresse, Zahlungsinformationen) werden direkt an Lemon
        Squeezy übermittelt und verarbeitet. Wir speichern selbst keine Zahlungsdaten, erhalten aber
        von Lemon Squeezy den Abo-Status und die E-Mail-Adresse, um Ihr Konto zuordnen zu können
        (Art. 6 Abs. 1 lit. b DSGVO). Es gelten die Datenschutzbestimmungen von Lemon Squeezy.
      </p>

      <h2>6. Hosting und Infrastruktur</h2>
      <p>
        Unsere Website wird gehostet bei{" "}
        <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a>{" "}
        (Vercel Inc., USA) und{" "}
        <a href="https://supabase.com" target="_blank" rel="noreferrer">Supabase</a>{" "}
        (Supabase Inc., USA). Beim Aufruf der Website werden durch den Hosting-Anbieter
        automatisch Server-Log-Daten (IP-Adresse, Browserkennung, angeforderte Seiten) verarbeitet
        (Art. 6 Abs. 1 lit. f DSGVO). Beide Anbieter sind nach dem EU-US-Datenrahmen zertifiziert.
      </p>

      <h2>7. Automatisierte Inhaltserstellung</h2>
      <p>
        Zur Erstellung der Newsletter-Inhalte setzen wir Drittanbieter ein (insb. Groq und
        OpenRouter). An diese Dienstleister werden ausschließlich öffentliche Nachrichtenquellen und
        keine personenbezogenen Daten Ihrer Person übermittelt.
      </p>

      <h2>8. Speicherdauer</h2>
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie dies für die genannten Zwecke
        erforderlich ist. Kontodaten werden nach Löschung des Kontos bzw. nach Beendigung des
        Abonnements gelöscht, soweit nicht gesetzliche Aufbewahrungspflichten entgegenstehen
        (z. B. handels- und steuerrechtliche Aufbewahrungsfristen von bis zu 10 Jahren).
      </p>

      <h2>9. Ihre Rechte</h2>
      <p>Sie haben im Rahmen der gesetzlichen Bestimmungen folgende Rechte:</p>
      <ul>
        <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung („Recht auf Vergessenwerden“, Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft</li>
      </ul>
      <p>
        Zur Ausübung Ihrer Rechte genügt eine E-Mail an [E-Mail-Adresse]. Sie haben außerdem das
        Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO).
      </p>

      <h2>10. SSL-/TLS-Verschlüsselung</h2>
      <p>
        Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
        Inhalte eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an dem
        „https://“ in der Adresszeile Ihres Browsers.
      </p>

      <h2>11. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
        aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen
        umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
      </p>
    </LegalPage>
  );
}
