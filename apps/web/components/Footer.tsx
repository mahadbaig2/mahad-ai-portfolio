import Link from 'next/link';
export function Footer() {
  return <footer className="new-footer"><div><Link href="/">Mirza Mahad Baig</Link><p>Products, interfaces and applied AI.</p></div><nav aria-label="Footer"><Link href="/work">Work</Link><Link href="/about">About</Link><Link href="/chat">Chat</Link><Link href="/contact">Contact</Link><a href="https://github.com/mahadbaig2" target="_blank" rel="noreferrer">GitHub</a><a href="https://linkedin.com/in/mahadbaig" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://medium.com/@mirza.mahad" target="_blank" rel="noreferrer">Medium</a></nav><small>© {new Date().getFullYear()} Mirza Mahad Baig</small></footer>;
}
