/**
 * Gera uma paleta coerente (HSL) e aplica em :root antes do primeiro paint.
 * Chamado em main.ts para que cada recarregamento traga cores novas.
 */
export function applyRandomTheme(): void {
  const h = Math.random() * 360;
  const accent = (h + 32) % 360;
  const nav = (h + 200) % 360;
  const warm = (h + 22) % 360;
  const danger = (h + 10) % 360;

  const root = document.documentElement;

  root.style.setProperty('--color-bg', `hsl(${h} 32% 96%)`);
  root.style.setProperty('--color-text', `hsl(${h} 40% 22%)`);
  root.style.setProperty('--color-primary', `hsl(${h} 38% 26%)`);
  root.style.setProperty('--color-on-primary', `hsl(${h} 35% 97%)`);
  root.style.setProperty('--color-accent', `hsl(${accent} 52% 48%)`);
  root.style.setProperty('--color-accent-warm', `hsl(${warm} 55% 44%)`);
  root.style.setProperty('--color-danger', `hsl(${danger} 45% 36%)`);
  root.style.setProperty('--color-muted', `hsl(${h} 36% 42%)`);
  root.style.setProperty('--color-nav', `hsl(${nav} 42% 34%)`);
  /* Não alterar --whatsapp-brand / botões WhatsApp: cor fixa só em styles.css */
  root.style.setProperty('--color-surface', '#ffffff');
  root.style.setProperty('--color-border', `hsl(${h} 18% 82%)`);
  root.style.setProperty('--color-border-soft', `hsl(${h} 14% 76%)`);
  root.style.setProperty('--color-hero-bg', `hsl(${danger} 48% 32%)`);

  root.style.setProperty('--color-on-primary-85', `hsl(${h} 35% 97% / 0.85)`);
  root.style.setProperty('--color-on-primary-65', `hsl(${h} 35% 97% / 0.65)`);
  root.style.setProperty('--color-on-primary-55', `hsl(${h} 35% 97% / 0.55)`);
  root.style.setProperty('--color-on-primary-50', `hsl(${h} 35% 97% / 0.5)`);
  root.style.setProperty('--color-on-primary-40', `hsl(${h} 35% 97% / 0.4)`);
  root.style.setProperty('--color-on-primary-30', `hsl(${h} 35% 97% / 0.3)`);
  root.style.setProperty('--color-on-primary-28', `hsl(${h} 35% 97% / 0.28)`);
  root.style.setProperty('--color-on-primary-18', `hsl(${h} 35% 97% / 0.18)`);
  root.style.setProperty('--color-on-primary-15', `hsl(${h} 35% 97% / 0.15)`);
  root.style.setProperty('--color-on-primary-12', `hsl(${h} 35% 97% / 0.12)`);
  root.style.setProperty('--color-on-primary-10', `hsl(${h} 35% 97% / 0.1)`);
  root.style.setProperty('--color-on-primary-07', `hsl(${h} 35% 97% / 0.07)`);

  root.style.setProperty('--shadow-primary', `0 4px 14px hsl(${h} 38% 26% / 0.35)`);
  root.style.setProperty('--shadow-primary-lg', `0 6px 20px hsl(${h} 38% 26% / 0.45)`);
}
