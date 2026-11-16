import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  return <footer className="new-footer">
    <div className="footer-top">
      <Link className="footer-name" href="/">Mirza Mahad Baig</Link>
      <p>AI product engineering, grounded in product design.</p>
    </div>
    <nav aria-label="Footer">
      <Link href="/work">Work</Link>
      <Link href="/about">About</Link>
      <Link href="/writing">Writing</Link>
      <Link href="/travel">Travel</Link>
      <Link href="/playground">Playground</Link>
      <Link href="/chat">Talk to Mahad</Link>
      <Link href="/contact">Contact</Link>
    </nav>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Mirza Mahad Baig</span><a href="https://github.com/mahadbaig2" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a><a href="https://linkedin.com/in/mahadbaig" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a></div>
  </footer>;
}
