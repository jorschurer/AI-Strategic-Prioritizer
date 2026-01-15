'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Textarea } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    decision_question: '',
    deadline: '',
    interview_start: '',
    interview_end: '',
    admin_email: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          decision_question: formData.decision_question,
          deadline: formData.deadline,
          interview_start: formData.interview_start,
          interview_end: formData.interview_end,
          admin_email: formData.admin_email,
          status: 'draft',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/admin/projects/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück zum Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Neues Projekt erstellen</CardTitle>
          <CardDescription>
            Definieren Sie das Problem und den Zeitraum für die Stakeholder-Interviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Projekttitel"
              name="title"
              placeholder="z.B. Cloud Migration Entscheidung"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Projektbeschreibung"
              name="description"
              placeholder="Kurze Beschreibung des Projektkontexts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Textarea
              label="Zu klärende Entscheidung / Problem"
              name="decision_question"
              placeholder="Welche konkrete Entscheidung soll getroffen werden?"
              required
              value={formData.decision_question}
              onChange={(e) => setFormData({ ...formData, decision_question: e.target.value })}
            />

            <Input
              label="Deadline für Entscheidung"
              name="deadline"
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Interview-Zeitfenster Start"
                name="interview_start"
                type="datetime-local"
                required
                value={formData.interview_start}
                onChange={(e) => setFormData({ ...formData, interview_start: e.target.value })}
              />
              <Input
                label="Interview-Zeitfenster Ende"
                name="interview_end"
                type="datetime-local"
                required
                value={formData.interview_end}
                onChange={(e) => setFormData({ ...formData, interview_end: e.target.value })}
              />
            </div>

            <Input
              label="Admin E-Mail"
              name="admin_email"
              type="email"
              placeholder="ihre@email.com"
              required
              value={formData.admin_email}
              onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
              helperText="Sie erhalten Benachrichtigungen zu diesem Projekt."
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Link href="/admin">
                <Button type="button" variant="secondary">
                  Abbrechen
                </Button>
              </Link>
              <Button type="submit" loading={loading}>
                Projekt erstellen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
