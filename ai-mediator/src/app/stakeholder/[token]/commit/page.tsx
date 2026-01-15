'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Textarea } from '@/components/ui';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import type { Project, Stakeholder, DecisionMemo, Commitment, CommitmentType } from '@/types/database';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function StakeholderCommitPage({ params }: PageProps) {
  const { token } = use(params);
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [memo, setMemo] = useState<DecisionMemo | null>(null);
  const [existingCommitment, setExistingCommitment] = useState<Commitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDecision, setSelectedDecision] = useState<CommitmentType | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

      if (stakeholderError) throw new Error('Ungültiger Link');

      const [
        { data: projectData, error: projectError },
        { data: memoData },
        { data: commitmentData },
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', stakeholderData.project_id).single(),
        supabase.from('decision_memos').select('*').eq('project_id', stakeholderData.project_id).single(),
        supabase.from('commitments').select('*').eq('stakeholder_id', stakeholderData.id).single(),
      ]);

      if (projectError) throw projectError;

      setStakeholder(stakeholderData);
      setProject(projectData);
      setMemo(memoData);

      if (commitmentData) {
        setExistingCommitment(commitmentData);
        setSelectedDecision(commitmentData.decision);
        setComment(commitmentData.comment || '');
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  async function saveCommitment() {
    if (!stakeholder || !project || !selectedDecision) return;
    setSaving(true);

    try {
      const supabase = createClient();

      if (existingCommitment) {
        await supabase
          .from('commitments')
          .update({
            decision: selectedDecision,
            comment: comment || null,
          })
          .eq('id', existingCommitment.id);
      } else {
        await supabase.from('commitments').insert({
          stakeholder_id: stakeholder.id,
          project_id: project.id,
          decision: selectedDecision,
          comment: comment || null,
        });

        await supabase
          .from('stakeholders')
          .update({ status: 'committed' })
          .eq('id', stakeholder.id);
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
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
            <p className="text-red-600">{error || 'Nicht gefunden'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Decision Memo noch nicht bereit
              </h2>
              <p className="text-gray-600">
                Das Decision Memo wird erstellt, sobald alle Stakeholder-Interviews abgeschlossen sind.
                Bitte schauen Sie später wieder vorbei.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>
              Bitte geben Sie Ihr Commitment zur vorgeschlagenen Entscheidung ab.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Decision Memo Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Empfohlene Entscheidung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-primary-900 text-lg mb-2">
                {memo.recommendation}
              </h3>
              <p className="text-primary-700">{memo.recommendation_rationale}</p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-700">Bewertete Optionen:</h4>
              {memo.options.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{option.title}</h5>
                  <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Pro:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {option.pros.map((pro, i) => (
                          <li key={i}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">Contra:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {option.cons.map((con, i) => (
                          <li key={i}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tradeoffs */}
            {memo.tradeoffs.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Tradeoffs:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {memo.tradeoffs.map((tradeoff, i) => (
                    <li key={i}>{tradeoff}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Open Questions */}
            {memo.open_questions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Offene Fragen:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {memo.open_questions.map((question, i) => (
                    <li key={i}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commitment Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Ihr Commitment</CardTitle>
            <CardDescription>
              Wählen Sie Ihre Position zur empfohlenen Entscheidung.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <CommitmentOption
                type="agree"
                icon={<CheckCircle className="h-8 w-8" />}
                title="Zustimmung"
                description="Ich stimme der Empfehlung zu."
                selected={selectedDecision === 'agree'}
                onClick={() => setSelectedDecision('agree')}
                color="green"
              />
              <CommitmentOption
                type="need_change"
                icon={<AlertTriangle className="h-8 w-8" />}
                title="Änderung nötig"
                description="Ich stimme zu, wenn Änderungen vorgenommen werden."
                selected={selectedDecision === 'need_change'}
                onClick={() => setSelectedDecision('need_change')}
                color="orange"
              />
              <CommitmentOption
                type="block"
                icon={<XCircle className="h-8 w-8" />}
                title="Blockade"
                description="Ich kann dieser Entscheidung nicht zustimmen."
                selected={selectedDecision === 'block'}
                onClick={() => setSelectedDecision('block')}
                color="red"
              />
            </div>

            {selectedDecision && selectedDecision !== 'agree' && (
              <Textarea
                label="Kommentar (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  selectedDecision === 'block'
                    ? 'Warum können Sie nicht zustimmen?'
                    : 'Welche Änderungen sind nötig?'
                }
              />
            )}

            {saved ? (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">
                  Ihr Commitment wurde gespeichert.
                </p>
                <p className="text-green-600 text-sm">
                  Sie können Ihre Entscheidung jederzeit ändern.
                </p>
              </div>
            ) : (
              <div className="flex justify-end mt-6">
                <Button
                  onClick={saveCommitment}
                  loading={saving}
                  disabled={!selectedDecision}
                >
                  Commitment abgeben
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CommitmentOption({
  type,
  icon,
  title,
  description,
  selected,
  onClick,
  color,
}: {
  type: CommitmentType;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  color: 'green' | 'orange' | 'red';
}) {
  const colors = {
    green: {
      selected: 'border-green-500 bg-green-50',
      icon: 'text-green-600',
    },
    orange: {
      selected: 'border-orange-500 bg-orange-50',
      icon: 'text-orange-600',
    },
    red: {
      selected: 'border-red-500 bg-red-50',
      icon: 'text-red-600',
    },
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        selected
          ? colors[color].selected
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className={`mb-2 ${selected ? colors[color].icon : 'text-gray-400'}`}>
        {icon}
      </div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  );
}
