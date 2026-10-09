import type { Locale } from "@/lib/i18n";
import { backgroundSources, backgroundTranslations } from "@/lib/incident-background";

export default function IncidentBackground({ locale }: { locale: Locale }) {
  const t = backgroundTranslations[locale];
  return <section className="background-section" id="incident-background" aria-labelledby="incident-background-title">
    <header className="background-heading">
      <div className="eyebrow">{t.eyebrow}</div>
      <h2 id="incident-background-title">{t.title}</h2>
      <p className="background-period">{t.period}</p>
    </header>
    <div className="background-copy">
      {t.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      <div className="background-sources"><span>{t.sourcesLabel}</span>{backgroundSources.map((source, index) =>
        <a key={source} href={source} target="_blank" rel="noreferrer">{t.sourceNames[index]} ↗</a>)}</div>
    </div>
  </section>;
}
