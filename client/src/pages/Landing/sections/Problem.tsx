const S = { section: { padding: '96px 0', borderTop: '1px solid var(--border)' } };

export function Problem() {
  return (
    <section style={S.section} id="problem">
      <div className="landing-wrap">
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <span className="t-eyebrow" style={{ display: 'block', marginBottom: 14 }}>Problem</span>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>Cztery panele, cztery formaty, cztery razy więcej pracy</h2>
          <p style={{ color: 'var(--ink-2)', fontSize: 18, lineHeight: 1.5, margin: 0 }}>Każda platforma to inny edytor, inne ograniczenia tytułu, inny język opisu. Sprzedawca traci kilka godzin tygodniowo na pracę, która nie sprzedaje.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="problem-grid">
          {[
            { num: '01', title: 'Ręczne wystawianie ×4', desc: 'Każde ogłoszenie wpisujesz cztery razy. Te same zdjęcia wgrywasz cztery razy. Te same atrybuty zaznaczasz cztery razy.',
              vis: <svg width="100%" height="80" viewBox="0 0 320 80" fill="none"><rect x="0" y="20" width="68" height="40" rx="6" fill="#FBF9F3" stroke="#E6DFCD"/><rect x="84" y="20" width="68" height="40" rx="6" fill="#FBF9F3" stroke="#E6DFCD"/><rect x="168" y="20" width="68" height="40" rx="6" fill="#FBF9F3" stroke="#E6DFCD"/><rect x="252" y="20" width="68" height="40" rx="6" fill="#FBF9F3" stroke="#E6DFCD"/><text x="34" y="44" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#6F7C8C">ALLEGRO</text><text x="118" y="44" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#6F7C8C">OLX</text><text x="202" y="44" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#6F7C8C">OTOMOTO</text><text x="286" y="44" textAnchor="middle" fontFamily="DM Mono" fontSize="10" fill="#6F7C8C">OVOKO</text><circle cx="34" cy="20" r="6" fill="#FF5A2C"/><circle cx="118" cy="20" r="6" fill="#5C9300"/><circle cx="202" cy="20" r="6" fill="#C3252A"/><circle cx="286" cy="20" r="6" fill="#1F66C2"/></svg> },
            { num: '02', title: 'Każda platforma — inne limity', desc: 'Allegro ucina tytuł po 75 znakach. OLX po 70. Otomoto wymaga innej struktury. Pomyłka = niższe pozycje w wyszukiwarce.',
              vis: <svg width="100%" height="80" viewBox="0 0 320 80" fill="none"><rect x="20" y="14" width="280" height="14" rx="3" fill="#FBF9F3" stroke="#E6DFCD"/><rect x="20" y="14" width="200" height="14" rx="3" fill="#FFEDDF" stroke="#FF6A1A"/><text x="296" y="24" textAnchor="end" fontFamily="DM Mono" fontSize="9" fill="#FF6A1A">75</text><rect x="20" y="36" width="240" height="14" rx="3" fill="#FBF9F3" stroke="#E6DFCD"/><rect x="20" y="36" width="200" height="14" rx="3" fill="#ECF4D6" stroke="#5C9300"/><text x="256" y="46" textAnchor="end" fontFamily="DM Mono" fontSize="9" fill="#5C9300">70</text><rect x="20" y="58" width="220" height="14" rx="3" fill="#FBF9F3" stroke="#E6DFCD"/><rect x="20" y="58" width="200" height="14" rx="3" fill="#FBDDDD" stroke="#C3252A"/><text x="236" y="68" textAnchor="end" fontFamily="DM Mono" fontSize="9" fill="#C3252A">65</text></svg> },
            { num: '03', title: 'Nie wiesz co jest aktywne', desc: 'Ogłoszenie wygasło na OLX trzy dni temu. Na Allegro się sprzedało. A Ty dowiesz się z opóźnieniem.',
              vis: <svg width="100%" height="80" viewBox="0 0 320 80" fill="none"><rect x="20" y="20" width="280" height="40" rx="8" fill="#FBF9F3" stroke="#E6DFCD"/><circle cx="44" cy="40" r="5" fill="#16794B"/><text x="56" y="44" fontFamily="DM Sans" fontSize="11" fill="#0E1B2C">Aktywne</text><text x="112" y="44" fontFamily="DM Mono" fontSize="11" fill="#0E1B2C">147</text><line x1="150" y1="28" x2="150" y2="52" stroke="#E6DFCD"/><circle cx="172" cy="40" r="5" fill="#B26B00"/><text x="184" y="44" fontFamily="DM Sans" fontSize="11" fill="#0E1B2C">Wygasłe</text><text x="234" y="44" fontFamily="DM Mono" fontSize="11" fill="#B26B00">?</text></svg> },
          ].map(({ num, title, desc, vis }) => (
            <div key={num} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
              <div style={{ height: 96, marginBottom: 4, display: 'flex', alignItems: 'center' }}>{vis}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em' }}>{num}</div>
              <h3 style={{ margin: '18px 0 10px', fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{title}</h3>
              <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
