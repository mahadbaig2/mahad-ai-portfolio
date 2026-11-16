'use client';

import { ArrowUpRight } from 'lucide-react';
import { useAssistantWidget } from '@/components/assistant/AssistantWidgetContext';

export function OpenAssistantButton({ className = '' }: { className?: string }) {
  const { openWidget } = useAssistantWidget();
  return <button className={className} type="button" onClick={() => openWidget('chat')}>
    Talk to Mahad <ArrowUpRight size={19} aria-hidden="true" />
  </button>;
}
