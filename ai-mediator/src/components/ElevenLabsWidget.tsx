'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface ElevenLabsWidgetProps {
  agentId: string;
  onConversationEnd?: (transcript: string, summary: InterviewSummary) => void;
  onError?: (error: Error) => void;
  projectContext?: {
    title: string;
    decisionQuestion: string;
    stakeholderName: string;
    stakeholderRole: string;
  };
}

export interface InterviewSummary {
  goals: string;
  no_gos: string;
  concerns: string;
  conditions: string;
}

declare global {
  interface Window {
    ElevenLabsConversationalAI?: {
      new (config: {
        agentId: string;
        onConnect?: () => void;
        onDisconnect?: () => void;
        onMessage?: (message: { role: string; content: string }) => void;
        onError?: (error: Error) => void;
      }): {
        connect: () => Promise<void>;
        disconnect: () => void;
        sendMessage: (message: string) => void;
      };
    };
  }
}

export function ElevenLabsWidget({
  agentId,
  onConversationEnd,
  onError,
  projectContext,
}: ElevenLabsWidgetProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [transcript, setTranscript] = useState<{ role: string; content: string }[]>([]);
  const conversationRef = useRef<ReturnType<typeof createConversation> | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load ElevenLabs SDK script
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (conversationRef.current) {
        conversationRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll transcript
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  function createConversation() {
    if (!window.ElevenLabsConversationalAI) {
      throw new Error('ElevenLabs SDK not loaded');
    }

    return new window.ElevenLabsConversationalAI({
      agentId,
      onConnect: () => {
        setStatus('connected');
      },
      onDisconnect: () => {
        setStatus('idle');
        // Generate summary from transcript
        if (transcript.length > 0 && onConversationEnd) {
          const fullTranscript = transcript.map((m) => `${m.role}: ${m.content}`).join('\n');
          const summary = extractSummaryFromTranscript(transcript);
          onConversationEnd(fullTranscript, summary);
        }
      },
      onMessage: (message) => {
        setTranscript((prev) => [...prev, message]);
      },
      onError: (error) => {
        setStatus('error');
        onError?.(error);
      },
    });
  }

  async function startConversation() {
    try {
      setStatus('connecting');
      conversationRef.current = createConversation();
      await conversationRef.current.connect();

      // Send initial context if available
      if (projectContext) {
        conversationRef.current.sendMessage(
          `Kontext: Projekt "${projectContext.title}", Entscheidung: "${projectContext.decisionQuestion}". ` +
          `Stakeholder: ${projectContext.stakeholderName} (${projectContext.stakeholderRole}).`
        );
      }
    } catch (error) {
      setStatus('error');
      onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }

  function endConversation() {
    conversationRef.current?.disconnect();
    conversationRef.current = null;
  }

  function extractSummaryFromTranscript(
    messages: { role: string; content: string }[]
  ): InterviewSummary {
    // This is a simplified extraction - in production, you'd use AI to extract this
    const userMessages = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');

    return {
      goals: extractSection(userMessages, ['ziel', 'erreichen', 'wichtig']),
      no_gos: extractSection(userMessages, ['no-go', 'nicht', 'niemals', 'ablehnen']),
      concerns: extractSection(userMessages, ['bedenken', 'sorge', 'risiko', 'problem']),
      conditions: extractSection(userMessages, ['bedingung', 'wenn', 'voraussetzung', 'nur falls']),
    };
  }

  function extractSection(text: string, keywords: string[]): string {
    // Simple keyword-based extraction - would be replaced with AI in production
    const sentences = text.split(/[.!?]+/);
    const relevant = sentences.filter((sentence) =>
      keywords.some((keyword) => sentence.toLowerCase().includes(keyword))
    );
    return relevant.join('. ').trim() || 'Keine spezifischen Angaben erfasst.';
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Status Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            status === 'connected'
              ? 'bg-green-500 animate-pulse'
              : status === 'connecting'
              ? 'bg-yellow-500'
              : status === 'error'
              ? 'bg-red-500'
              : 'bg-gray-600'
          }`}
        >
          {status === 'connecting' ? (
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          ) : status === 'connected' ? (
            <Mic className="h-12 w-12 text-white" />
          ) : (
            <MicOff className="h-12 w-12 text-white" />
          )}
        </div>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div
          ref={transcriptContainerRef}
          className="mb-6 max-h-48 overflow-y-auto bg-gray-900 rounded-lg p-4"
        >
          {transcript.map((message, index) => (
            <div
              key={index}
              className={`mb-2 ${
                message.role === 'user' ? 'text-blue-400' : 'text-green-400'
              }`}
            >
              <span className="font-medium">
                {message.role === 'user' ? 'Sie: ' : 'AI: '}
              </span>
              <span className="text-gray-300">{message.content}</span>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center">
        {status === 'idle' || status === 'error' ? (
          <button
            onClick={startConversation}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <Mic className="h-5 w-5 mr-2" />
            Gespräch starten
          </button>
        ) : status === 'connecting' ? (
          <button
            disabled
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium flex items-center"
          >
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Verbinde...
          </button>
        ) : (
          <button
            onClick={endConversation}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <MicOff className="h-5 w-5 mr-2" />
            Gespräch beenden
          </button>
        )}
      </div>

      {/* Error Message */}
      {status === 'error' && (
        <p className="mt-4 text-center text-red-400 text-sm">
          Verbindungsfehler. Bitte versuchen Sie es erneut.
        </p>
      )}

      {/* Info */}
      <p className="mt-6 text-center text-gray-400 text-sm">
        {status === 'connected'
          ? 'Sprechen Sie frei - der AI Mediator hört zu.'
          : 'Klicken Sie auf "Gespräch starten" um das Interview zu beginnen.'}
      </p>
    </div>
  );
}

// Alternative: Simple embedded widget approach
export function ElevenLabsEmbedWidget({ agentId }: { agentId: string }) {
  return (
    <div className="w-full h-96">
      <iframe
        src={`https://elevenlabs.io/convai/${agentId}`}
        className="w-full h-full border-0 rounded-xl"
        allow="microphone"
        title="AI Mediator Voice Interface"
      />
    </div>
  );
}
