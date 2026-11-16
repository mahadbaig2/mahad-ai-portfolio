import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChatInterface } from '@/components/assistant/ChatInterface';

export const metadata = { title: 'Talk to Mahad | Mirza Mahad Baig', description: 'Explore Mahad’s work through the portfolio assistant.' };

export default function ChatPage() {
  return <div className="portfolio-shell chat-page"><main>
    <header className="chat-hero"><Link href="/work"><ArrowLeft size={17}/> Back to work</Link><h1>Ask about <em>the work.</em></h1><p>Explore projects, decisions and experience. Answers depend on the assistant service being available.</p></header>
    <div className="chat-panel"><ChatInterface /></div>
  </main></div>;
}
