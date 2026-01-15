'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Textarea } from '@/components/ui';
import { Mic, MicOff, Phone, PhoneOff, CheckCircle, AlertCircle } from 'lucide-react';
import type { Project, Stakeholder } from '@/types/database';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function StakeholderCallPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Call state
  const [callStatus, setCallStatus] = useState<'ready' | 'connecting' | 'active' | 'ended'>('ready');
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Summary state (for demo/manual entry)
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState({
    goals: '',
    no_gos: '',
    concerns: '',
    conditions: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [token]);

  async function loadData() {
    try {
      const supabase = createClient();

      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('token', token)
        .single();

      if (stakeholderError) throw new Error('Ungültiger Link');

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', stakeholderData.project_id)
        .single();

      if (projectError) throw projectError;

      setStakeholder(stakeholderData);
      setProject(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  function startCall() {
    setCallStatus('connecting');

    // Simulate connection delay
    setTimeout(() => {
      setCallStatus('active');
      callTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);

      // Initialize ElevenLabs widget here
      initElevenLabsWidget();
    }, 1500);
  }

  function initElevenLabsWidget() {
    // This would initialize the ElevenLabs Conversational AI widget
    // For MVP, we'll use a simulated approach
    // In production, you'd use:
    // const widget = new ElevenLabsWidget({ agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID });
    console.log('ElevenLabs Widget would be initialized here');
  }

  function endCall() {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setCallStatus('ended');
    setShowSummary(true);
  }

  async function saveSummary() {
    if (!stakeholder || !project) return;
    setSaving(true);

    try {
      const supabase = createClient();

      // Save interview
      await supabase.from('interviews').insert({
        stakeholder_id: stakeholder.id,
        project_id: project.id,
        goals: summary.goals,
        no_gos: summary.no_gos,
        concerns: summary.concerns,
        conditions: summary.conditions,
        call_duration_seconds: callDuration,
      });

      // Update stakeholder status
      await supabase
        .from('stakeholders')
        .update({ status: 'interviewed' })
        .eq('id', stakeholder.id);

      // Redirect to commitment page
      router.push(`/stakeholder/${token}/commit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (error || !stakeholder || !project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || 'Nicht gefunden'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                Interview abgeschlossen
              </CardTitle>
              <CardDescription>
                Bitte fassen Sie Ihre wichtigsten Punkte zusammen (wird vom AI automatisch ausgefüllt):
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Ihre Ziele für diese Entscheidung"
                value={summary.goals}
                onChange={(e) => setSummary({ ...summary, goals: e.target.value })}
                placeholder="Was ist Ihnen bei dieser Entscheidung wichtig?"
              />
              <Textarea
                label="No-Gos / Absolute Grenzen"
                value={summary.no_gos}
                onChange={(e) => setSummary({ ...summary, no_gos: e.target.value })}
                placeholder="Was darf auf keinen Fall passieren?"
              />
              <Textarea
                label="Bedenken und Risiken"
                value={summary.concerns}
                onChange={(e) => setSummary({ ...summary, concerns: e.target.value })}
                placeholder="Welche Bedenken haben Sie?"
              />
              <Textarea
                label="Bedingungen für Zustimmung"
                value={summary.conditions}
                onChange={(e) => setSummary({ ...summary, conditions: e.target.value })}
                placeholder="Unter welchen Bedingungen würden Sie zustimmen?"
              />

              <div className="flex justify-end pt-4">
                <Button onClick={saveSummary} loading={saving}>
                  Speichern & Weiter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-white font-semibold">{project.title}</h1>
            <p className="text-gray-400 text-sm">{stakeholder.name} - {stakeholder.role}</p>
          </div>
          {callStatus === 'active' && (
            <div className="text-white font-mono text-lg">
              {formatDuration(callDuration)}
            </div>
          )}
        </div>
      </header>

      {/* Main Call Area */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          {/* Voice Visualization Area */}
          <div className="mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
              callStatus === 'active'
                ? 'bg-primary-600 animate-pulse'
                : callStatus === 'connecting'
                ? 'bg-yellow-600 animate-pulse'
                : 'bg-gray-700'
            }`}>
              {callStatus === 'active' ? (
                <Mic className="h-16 w-16 text-white" />
              ) : callStatus === 'connecting' ? (
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
              ) : (
                <MicOff className="h-16 w-16 text-gray-400" />
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className="mb-8">
            {callStatus === 'ready' && (
              <>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Bereit für das Interview
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Der AI Mediator wird Ihnen Fragen zu Ihren Zielen, Bedenken und
                  Bedingungen für die Entscheidung &ldquo;{project.decision_question}&rdquo; stellen.
                </p>
              </>
            )}
            {callStatus === 'connecting' && (
              <h2 className="text-2xl font-semibold text-white">
                Verbindung wird hergestellt...
              </h2>
            )}
            {callStatus === 'active' && (
              <>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Interview läuft
                </h2>
                <p className="text-gray-400">
                  Sprechen Sie frei über Ihre Perspektive.
                </p>
              </>
            )}
          </div>

          {/* ElevenLabs Widget Container */}
          <div id="elevenlabs-widget" className="voice-widget-container mb-8">
            {/* ElevenLabs widget will be mounted here */}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-4">
            {callStatus === 'ready' && (
              <Button size="lg" onClick={startCall} className="bg-green-600 hover:bg-green-700">
                <Phone className="h-6 w-6 mr-2" />
                Gespräch starten
              </Button>
            )}
            {callStatus === 'active' && (
              <Button size="lg" onClick={endCall} className="bg-red-600 hover:bg-red-700">
                <PhoneOff className="h-6 w-6 mr-2" />
                Gespräch beenden
              </Button>
            )}
          </div>

          {/* Info Text */}
          <div className="mt-8 text-gray-500 text-sm max-w-md mx-auto">
            <p>
              Das Gespräch wird aufgezeichnet und zusammengefasst, um ein Decision Memo
              für alle Stakeholder zu erstellen.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
