'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateTimeSlots, formatDate, formatTime, formatDateTime } from '@/lib/utils';
import { generateICS, downloadICS } from '@/lib/ics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { Calendar, Clock, Download, ArrowRight, CheckCircle } from 'lucide-react';
import type { Project, Stakeholder } from '@/types/database';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function StakeholderInvitePage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [token]);

  async function loadData() {
    try {
      const supabase = createClient();

      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('token', token)
        .single();

      if (stakeholderError) throw new Error('Ungültiger Einladungslink');

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', stakeholderData.project_id)
        .single();

      if (projectError) throw projectError;

      setStakeholder(stakeholderData);
      setProject(projectData);

      if (stakeholderData.scheduled_time) {
        setSelectedSlot(new Date(stakeholderData.scheduled_time));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  async function saveSlot() {
    if (!selectedSlot || !stakeholder) return;
    setSaving(true);

    try {
      const supabase = createClient();

      await supabase
        .from('stakeholders')
        .update({
          scheduled_time: selectedSlot.toISOString(),
          status: 'scheduled',
        })
        .eq('id', stakeholder.id);

      setStakeholder({ ...stakeholder, status: 'scheduled', scheduled_time: selectedSlot.toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  }

  async function downloadCalendar() {
    if (!selectedSlot || !project || !stakeholder) return;

    const callUrl = `${window.location.origin}/stakeholder/${token}/call`;

    const icsContent = await generateICS({
      title: `AI Mediator Interview: ${project.title}`,
      description: `Ihr Stakeholder-Interview für das Projekt "${project.title}".\n\n${project.decision_question}`,
      startTime: selectedSlot,
      durationMinutes: 15,
      url: callUrl,
      attendee: { name: stakeholder.name, email: stakeholder.email },
    });

    downloadICS(icsContent, `interview-${project.title.toLowerCase().replace(/\s+/g, '-')}.ics`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !stakeholder || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-2">Fehler</p>
            <p className="text-gray-600">{error || 'Einladung nicht gefunden'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if already interviewed
  if (stakeholder.status === 'interviewed' || stakeholder.status === 'committed') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Interview abgeschlossen
              </h1>
              <p className="text-gray-600 mb-6">
                Vielen Dank für Ihre Teilnahme am Interview für &ldquo;{project.title}&rdquo;.
              </p>
              {stakeholder.status === 'interviewed' && (
                <Button onClick={() => router.push(`/stakeholder/${token}/commit`)}>
                  Zum Commitment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timeSlots = generateTimeSlots(project.interview_start, project.interview_end, 15);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome */}
        <Card>
          <CardHeader>
            <CardTitle>Willkommen, {stakeholder.name}</CardTitle>
            <CardDescription>
              Sie wurden eingeladen, an einem Stakeholder-Interview für das folgende Projekt teilzunehmen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.decision_question}</p>
              <p className="text-sm text-gray-500">
                Deadline: {formatDate(project.deadline)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Slot Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Interview-Termin wählen
            </CardTitle>
            <CardDescription>
              Wählen Sie einen 15-minütigen Slot für Ihr Gespräch mit dem AI Mediator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.getTime() === slot.getTime();
                return (
                  <button
                    key={slot.toISOString()}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-medium">{formatDate(slot)}</div>
                    <div className={isSelected ? 'text-primary-100' : 'text-gray-500'}>
                      {formatTime(slot)}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedSlot && (
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary-900">
                      Gewählter Termin:
                    </p>
                    <p className="text-primary-700">
                      {formatDateTime(selectedSlot)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={downloadCalendar}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      .ics
                    </Button>
                    {stakeholder.status === 'invited' && (
                      <Button size="sm" onClick={saveSlot} loading={saving}>
                        Bestätigen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Call */}
        {stakeholder.status === 'scheduled' && (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bereit für das Interview?
              </h3>
              <p className="text-gray-600 mb-6">
                Das Gespräch dauert ca. 10 Minuten. Ein KI-Agent wird Ihre Perspektive erfassen.
              </p>
              <Button size="lg" onClick={() => router.push(`/stakeholder/${token}/call`)}>
                Interview starten
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
