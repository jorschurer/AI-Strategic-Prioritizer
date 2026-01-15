'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { generateToken, formatDate, formatDateTime } from '@/lib/utils';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Button, Input, Badge
} from '@/components/ui';
import {
  ArrowLeft, Plus, Copy, Check, Users, FileText, Send, Trash2,
  ExternalLink, Download
} from 'lucide-react';
import type { Project, Stakeholder, Interview, Commitment } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add stakeholder form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [addingStakeholder, setAddingStakeholder] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  async function loadProjectData() {
    try {
      const supabase = createClient();

      const [
        { data: projectData, error: projectError },
        { data: stakeholdersData, error: stakeholdersError },
        { data: interviewsData, error: interviewsError },
        { data: commitmentsData, error: commitmentsError },
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('stakeholders').select('*').eq('project_id', projectId).order('created_at'),
        supabase.from('interviews').select('*').eq('project_id', projectId),
        supabase.from('commitments').select('*').eq('project_id', projectId),
      ]);

      if (projectError) throw projectError;

      setProject(projectData);
      setStakeholders(stakeholdersData || []);
      setInterviews(interviewsData || []);
      setCommitments(commitmentsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  async function addStakeholder(e: React.FormEvent) {
    e.preventDefault();
    setAddingStakeholder(true);

    try {
      const supabase = createClient();
      const token = generateToken();

      const { data, error: insertError } = await supabase
        .from('stakeholders')
        .insert({
          project_id: projectId,
          name: newStakeholder.name,
          email: newStakeholder.email,
          role: newStakeholder.role,
          token,
          status: 'invited',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setStakeholders([...stakeholders, data]);
      setNewStakeholder({ name: '', email: '', role: '' });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen');
    } finally {
      setAddingStakeholder(false);
    }
  }

  async function deleteStakeholder(id: string) {
    if (!confirm('Stakeholder wirklich löschen?')) return;

    try {
      const supabase = createClient();
      await supabase.from('stakeholders').delete().eq('id', id);
      setStakeholders(stakeholders.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen');
    }
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/stakeholder/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  async function updateProjectStatus(status: Project['status']) {
    try {
      const supabase = createClient();
      await supabase.from('projects').update({ status }).eq('id', projectId);
      setProject({ ...project!, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Update');
    }
  }

  async function generateMemo() {
    // In a real app, this would call an AI API to generate the memo
    // For MVP, we'll create a placeholder
    try {
      const supabase = createClient();

      const { error: memoError } = await supabase
        .from('decision_memos')
        .insert({
          project_id: projectId,
          options: [
            {
              title: 'Option A',
              description: 'Basierend auf Stakeholder-Feedback',
              pros: ['Pro 1', 'Pro 2'],
              cons: ['Con 1'],
            },
            {
              title: 'Option B',
              description: 'Alternative basierend auf Bedenken',
              pros: ['Pro 1'],
              cons: ['Con 1', 'Con 2'],
            },
          ],
          recommendation: 'Option A',
          recommendation_rationale: 'Basierend auf der Mehrheit der Stakeholder-Ziele und minimalen Konflikten.',
          tradeoffs: ['Tradeoff 1', 'Tradeoff 2'],
          open_questions: ['Offene Frage 1'],
        });

      if (memoError) throw memoError;

      await updateProjectStatus('memo_ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-600">Fehler: {error || 'Projekt nicht gefunden'}</p>
        </CardContent>
      </Card>
    );
  }

  const interviewedCount = stakeholders.filter((s) => s.status === 'interviewed' || s.status === 'committed').length;
  const allInterviewed = stakeholders.length > 0 && interviewedCount === stakeholders.length;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück zum Dashboard
      </Link>

      {/* Project Header */}
      <Card>
        <CardContent>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <Badge status={project.status} />
              </div>
              <p className="text-gray-600 mb-4">{project.decision_question}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Deadline: {formatDate(project.deadline)}</span>
                <span>
                  Interviews: {formatDateTime(project.interview_start)} - {formatDateTime(project.interview_end)}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              {project.status === 'draft' && stakeholders.length > 0 && (
                <Button onClick={() => updateProjectStatus('collecting')}>
                  <Send className="h-4 w-4 mr-2" />
                  Interviews starten
                </Button>
              )}
              {project.status === 'collecting' && allInterviewed && (
                <Button onClick={generateMemo}>
                  <FileText className="h-4 w-4 mr-2" />
                  Memo generieren
                </Button>
              )}
              {(project.status === 'memo_ready' || project.status === 'commitments') && (
                <Link href={`/project/${projectId}/memo`}>
                  <Button variant="secondary">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Memo ansehen
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-gray-900">{stakeholders.length}</p>
            <p className="text-sm text-gray-500">Stakeholder</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stakeholders.filter((s) => s.status === 'scheduled').length}
            </p>
            <p className="text-sm text-gray-500">Terminiert</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{interviewedCount}</p>
            <p className="text-sm text-gray-500">Interviewt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-green-600">{commitments.length}</p>
            <p className="text-sm text-gray-500">Commitments</p>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholders */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Stakeholder</CardTitle>
              <CardDescription>
                Verwalten Sie die Stakeholder und deren Einladungslinks.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={addStakeholder} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <Input
                  label="Name"
                  name="name"
                  required
                  value={newStakeholder.name}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                />
                <Input
                  label="E-Mail"
                  name="email"
                  type="email"
                  required
                  value={newStakeholder.email}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                />
                <Input
                  label="Rolle"
                  name="role"
                  required
                  placeholder="z.B. Product Owner"
                  value={newStakeholder.role}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" size="sm" loading={addingStakeholder}>
                  Speichern
                </Button>
              </div>
            </form>
          )}

          {stakeholders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Noch keine Stakeholder hinzugefügt.
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {stakeholders.map((stakeholder) => {
                const interview = interviews.find((i) => i.stakeholder_id === stakeholder.id);
                const commitment = commitments.find((c) => c.stakeholder_id === stakeholder.id);

                return (
                  <div key={stakeholder.id} className="py-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="font-medium text-gray-900">{stakeholder.name}</p>
                        <Badge status={stakeholder.status} />
                        {commitment && <Badge status={commitment.decision} />}
                      </div>
                      <p className="text-sm text-gray-500">
                        {stakeholder.role} - {stakeholder.email}
                      </p>
                      {stakeholder.scheduled_time && (
                        <p className="text-sm text-blue-600">
                          Termin: {formatDateTime(stakeholder.scheduled_time)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInviteLink(stakeholder.token)}
                        title="Link kopieren"
                      >
                        {copiedToken === stakeholder.token ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStakeholder(stakeholder.id)}
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commitments Summary */}
      {commitments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Commitments Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {commitments.filter((c) => c.decision === 'agree').length}
                </p>
                <p className="text-sm text-green-700">Zustimmungen</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">
                  {commitments.filter((c) => c.decision === 'block').length}
                </p>
                <p className="text-sm text-red-700">Blockaden</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {commitments.filter((c) => c.decision === 'need_change').length}
                </p>
                <p className="text-sm text-orange-700">Änderungswünsche</p>
              </div>
            </div>
            {commitments.some((c) => c.comment) && (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-gray-700">Kommentare:</p>
                {commitments
                  .filter((c) => c.comment)
                  .map((c) => {
                    const stakeholder = stakeholders.find((s) => s.id === c.stakeholder_id);
                    return (
                      <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">
                          {stakeholder?.name}:
                        </p>
                        <p className="text-sm text-gray-600">{c.comment}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
