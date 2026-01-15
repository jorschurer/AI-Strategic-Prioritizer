'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { FileText, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import type { Project, Stakeholder, Interview, DecisionMemo, Commitment } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DecisionMemoPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [memo, setMemo] = useState<DecisionMemo | null>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    try {
      const supabase = createClient();

      const [
        { data: projectData, error: projectError },
        { data: memoData },
        { data: stakeholdersData },
        { data: interviewsData },
        { data: commitmentsData },
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('decision_memos').select('*').eq('project_id', projectId).single(),
        supabase.from('stakeholders').select('*').eq('project_id', projectId),
        supabase.from('interviews').select('*').eq('project_id', projectId),
        supabase.from('commitments').select('*').eq('project_id', projectId),
      ]);

      if (projectError) throw projectError;

      setProject(projectData);
      setMemo(memoData);
      setStakeholders(stakeholdersData || []);
      setInterviews(interviewsData || []);
      setCommitments(commitmentsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600">{error || 'Projekt nicht gefunden'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agreeCount = commitments.filter((c) => c.decision === 'agree').length;
  const blockCount = commitments.filter((c) => c.decision === 'block').length;
  const changeCount = commitments.filter((c) => c.decision === 'need_change').length;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Decision Memo</h1>
          <p className="text-gray-600">{project.title}</p>
        </div>

        {/* Project Info */}
        <Card>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Entscheidungsfrage</h3>
                <p className="text-gray-900">{project.decision_question}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Details</h3>
                <p className="text-gray-600 text-sm">Deadline: {formatDate(project.deadline)}</p>
                <p className="text-gray-600 text-sm">{stakeholders.length} Stakeholder befragt</p>
                <p className="text-gray-600 text-sm">{commitments.length} Commitments abgegeben</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {memo ? (
          <>
            {/* Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle>Empfehlung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-primary-900 mb-3">
                    {memo.recommendation}
                  </h3>
                  <p className="text-primary-700">{memo.recommendation_rationale}</p>
                </div>
              </CardContent>
            </Card>

            {/* Options Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Optionen-Analyse</CardTitle>
                <CardDescription>
                  Bewertung der identifizierten Handlungsoptionen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memo.options.map((option, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        option.title === memo.recommendation
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{option.title}</h4>
                        {option.title === memo.recommendation && (
                          <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                            Empfohlen
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-3">
                          <h5 className="font-medium text-green-800 mb-2">Pro</h5>
                          <ul className="space-y-1">
                            {option.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-green-700 flex items-start">
                                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <h5 className="font-medium text-red-800 mb-2">Contra</h5>
                          <ul className="space-y-1">
                            {option.cons.map((con, i) => (
                              <li key={i} className="text-sm text-red-700 flex items-start">
                                <XCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tradeoffs */}
            {memo.tradeoffs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tradeoffs</CardTitle>
                  <CardDescription>
                    Wichtige Kompromisse und Abwägungen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {memo.tradeoffs.map((tradeoff, i) => (
                      <li key={i} className="flex items-start text-gray-700">
                        <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                          {i + 1}
                        </span>
                        {tradeoff}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Open Questions */}
            {memo.open_questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Offene Fragen</CardTitle>
                  <CardDescription>
                    Punkte, die noch geklärt werden müssen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {memo.open_questions.map((question, i) => (
                      <li key={i} className="flex items-start text-gray-700">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                        {question}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Das Decision Memo wird erstellt, sobald alle Interviews abgeschlossen sind.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stakeholder Inputs Summary */}
        {interviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Stakeholder-Inputs
              </CardTitle>
              <CardDescription>
                Zusammenfassung aller Interview-Ergebnisse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interviews.map((interview) => {
                  const stakeholder = stakeholders.find((s) => s.id === interview.stakeholder_id);
                  if (!stakeholder) return null;

                  return (
                    <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{stakeholder.name}</h4>
                          <p className="text-sm text-gray-500">{stakeholder.role}</p>
                        </div>
                        <Badge status={stakeholder.status} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {interview.goals && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Ziele:</p>
                            <p className="text-gray-600">{interview.goals}</p>
                          </div>
                        )}
                        {interview.no_gos && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">No-Gos:</p>
                            <p className="text-gray-600">{interview.no_gos}</p>
                          </div>
                        )}
                        {interview.concerns && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Bedenken:</p>
                            <p className="text-gray-600">{interview.concerns}</p>
                          </div>
                        )}
                        {interview.conditions && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Bedingungen:</p>
                            <p className="text-gray-600">{interview.conditions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commitments Overview */}
        {commitments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Commitment-Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{agreeCount}</p>
                  <p className="text-sm text-green-600">Zustimmungen</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-700">{changeCount}</p>
                  <p className="text-sm text-orange-600">Änderungswünsche</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-700">{blockCount}</p>
                  <p className="text-sm text-red-600">Blockaden</p>
                </div>
              </div>

              {/* Individual Commitments */}
              <div className="space-y-2">
                {commitments.map((commitment) => {
                  const stakeholder = stakeholders.find((s) => s.id === commitment.stakeholder_id);
                  if (!stakeholder) return null;

                  return (
                    <div
                      key={commitment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{stakeholder.name}</p>
                        <p className="text-sm text-gray-500">{stakeholder.role}</p>
                        {commitment.comment && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            &ldquo;{commitment.comment}&rdquo;
                          </p>
                        )}
                      </div>
                      <Badge status={commitment.decision} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
