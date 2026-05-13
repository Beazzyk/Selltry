import { useEffect } from 'react';
import { LandingNav } from './LandingNav';
import { Hero } from './sections/Hero';
import { Problem } from './sections/Problem';
import { HowItWorks } from './sections/HowItWorks';
import { Features } from './sections/Features';
import { Demo } from './sections/Demo';
import { Integrations } from './sections/Integrations';
import { Pricing } from './sections/Pricing';
import { CtaFinal } from './sections/CtaFinal';
import { LandingFooter } from './LandingFooter';

export default function LandingPage() {
  // Smooth scroll for anchor links
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' }); }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className="landing">
      <LandingNav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Demo />
      <Integrations />
      <Pricing />
      <CtaFinal />
      <LandingFooter />
    </div>
  );
}
