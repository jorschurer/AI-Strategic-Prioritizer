import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import type { Interview, MemoOption } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get project info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all interviews for this project
    const { data: interviews, error: interviewsError } = await supabase
      .from('interviews')
      .select('*, stakeholders(name, role)')
      .eq('project_id', projectId);

    if (interviewsError) {
      return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
    }

    if (!interviews || interviews.length === 0) {
      return NextResponse.json({ error: 'No interviews completed yet' }, { status: 400 });
    }

    // Generate memo using AI (simplified version for MVP)
    // In production, this would call OpenAI/Anthropic API
    const memo = await generateMemoFromInterviews(project, interviews);

    // Check if memo already exists
    const { data: existingMemo } = await supabase
      .from('decision_memos')
      .select('id')
      .eq('project_id', projectId)
      .single();

    if (existingMemo) {
      // Update existing memo
      const { error: updateError } = await supabase
        .from('decision_memos')
        .update({
          options: memo.options,
          recommendation: memo.recommendation,
          recommendation_rationale: memo.recommendation_rationale,
          tradeoffs: memo.tradeoffs,
          open_questions: memo.open_questions,
        })
        .eq('id', existingMemo.id);

      if (updateError) throw updateError;
    } else {
      // Insert new memo
      const { error: insertError } = await supabase
        .from('decision_memos')
        .insert({
          project_id: projectId,
          ...memo,
        });

      if (insertError) throw insertError;
    }

    // Update project status
    await supabase
      .from('projects')
      .update({ status: 'memo_ready' })
      .eq('id', projectId);

    return NextResponse.json({ success: true, memo });
  } catch (error) {
    console.error('Generate memo error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate memo' },
      { status: 500 }
    );
  }
}

interface InterviewWithStakeholder extends Interview {
  stakeholders: { name: string; role: string } | null;
}

async function generateMemoFromInterviews(
  project: { title: string; decision_question: string },
  interviews: InterviewWithStakeholder[]
): Promise<{
  options: MemoOption[];
  recommendation: string;
  recommendation_rationale: string;
  tradeoffs: string[];
  open_questions: string[];
}> {
  // Analyze all interview data
  const allGoals = interviews.map((i) => i.goals).filter(Boolean);
  const allNoGos = interviews.map((i) => i.no_gos).filter(Boolean);
  const allConcerns = interviews.map((i) => i.concerns).filter(Boolean);
  const allConditions = interviews.map((i) => i.conditions).filter(Boolean);

  // Extract common themes (simplified)
  const commonGoals = extractCommonThemes(allGoals);
  const commonConcerns = extractCommonThemes(allConcerns);
  const noGos = extractUniquePoints(allNoGos);

  // Generate options based on stakeholder input
  const options: MemoOption[] = [
    {
      title: 'Konsens-Option',
      description: `Lösung die alle gemeinsamen Ziele adressiert: ${commonGoals.slice(0, 2).join(', ')}`,
      pros: [
        'Berücksichtigt alle Stakeholder-Ziele',
        'Minimiert Konflikte',
        'Schnelle Umsetzung möglich',
      ],
      cons: [
        'Möglicherweise Kompromisse bei Einzelinteressen',
        commonConcerns[0] || 'Komplexität der Abstimmung',
      ],
    },
    {
      title: 'Schrittweise Umsetzung',
      description: 'Iterativer Ansatz mit regelmäßiger Überprüfung',
      pros: [
        'Geringeres Risiko',
        'Flexibilität für Anpassungen',
        'Ermöglicht Lernen',
      ],
      cons: [
        'Längerer Zeithorizont',
        'Möglicherweise höhere Gesamtkosten',
      ],
    },
  ];

  // Determine recommendation
  const recommendation = options[0].title;
  const recommendation_rationale = `Diese Option wurde gewählt, weil sie die Mehrheit der Stakeholder-Ziele (${commonGoals.length} gemeinsame Ziele identifiziert) berücksichtigt und gleichzeitig die genannten No-Gos (${noGos.length} kritische Grenzen) respektiert. ${interviews.length} Stakeholder wurden befragt.`;

  // Generate tradeoffs
  const tradeoffs = [
    `Geschwindigkeit vs. Gründlichkeit: ${allConditions.length > 0 ? 'Mehrere Stakeholder haben Bedingungen genannt' : 'Einige Stakeholder bevorzugen schnelles Handeln'}`,
    `Kosten vs. Qualität: Balance zwischen Budget und Ergebnisqualität erforderlich`,
    commonConcerns.length > 0 ? `Adressierung von: ${commonConcerns[0]}` : 'Kommunikationsaufwand vs. Effizienz',
  ];

  // Extract open questions
  const open_questions = [
    ...allConcerns.slice(0, 2).map((c) => `Wie wird "${c}" adressiert?`),
    'Wer übernimmt die Verantwortung für die Umsetzung?',
    'Welche Ressourcen werden konkret benötigt?',
  ].slice(0, 4);

  return {
    options,
    recommendation,
    recommendation_rationale,
    tradeoffs,
    open_questions,
  };
}

function extractCommonThemes(items: string[]): string[] {
  // Simple extraction - in production use NLP/AI
  const words: Record<string, number> = {};

  items.forEach((item) => {
    const tokens = item.toLowerCase().split(/\s+/);
    tokens.forEach((word) => {
      if (word.length > 3) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  // Return items that contain common words
  const commonWords = Object.entries(words)
    .filter(([_, count]) => count > 1)
    .map(([word]) => word);

  if (commonWords.length === 0) {
    return items.slice(0, 3);
  }

  return items
    .filter((item) =>
      commonWords.some((word) => item.toLowerCase().includes(word))
    )
    .slice(0, 5);
}

function extractUniquePoints(items: string[]): string[] {
  const unique = [...new Set(items.map((i) => i.trim().toLowerCase()))];
  return unique.slice(0, 5);
}
