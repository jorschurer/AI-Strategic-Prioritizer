# AI Mediator

Ein neutraler KI-Agent für Stakeholder-Alignment und Entscheidungsfindung.

## Problem

Projekte hängen oft, weil Stakeholder kein Alignment finden. Unterschiedliche Ziele, Bedenken und versteckte No-Gos führen zu endlosen Diskussionen ohne klare Entscheidungen.

## Lösung

AI Mediator führt strukturierte 1:1 Voice-Gespräche mit jedem Stakeholder, sammelt systematisch:
- **Ziele** - Was will der Stakeholder erreichen?
- **No-Gos** - Was darf auf keinen Fall passieren?
- **Bedenken** - Welche Risiken sieht der Stakeholder?
- **Bedingungen** - Unter welchen Umständen würde er zustimmen?

Aus diesen Inputs wird automatisch ein **Decision Memo** generiert mit:
- Optionen und deren Pro/Contra
- Empfehlung mit Begründung
- Tradeoffs
- Offene Fragen

Anschließend gibt jeder Stakeholder sein **Commitment** ab: Zustimmung, Blockade oder Änderungswunsch.

## Features

### Admin-Bereich
- Projekt erstellen (Titel, Entscheidungsfrage, Deadline)
- Interview-Zeitfenster definieren
- Stakeholder hinzufügen (Name, E-Mail, Rolle)
- Einladungslinks mit sicheren Tokens generieren
- Status-Dashboard für alle Stakeholder
- Decision Memo ansehen
- Commitments überwachen

### Stakeholder-Flow
1. Einladungslink öffnen
2. Interview-Slot im Zeitfenster wählen
3. Kalendereintrag (.ics) herunterladen
4. Voice-Interview mit AI Mediator führen
5. Nach Memo-Erstellung: Commitment abgeben

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Datenbank**: Supabase (PostgreSQL)
- **Voice**: ElevenLabs Conversational AI
- **Icons**: Lucide React

## Setup

### 1. Repository klonen

```bash
git clone <repo-url>
cd ai-mediator
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Supabase einrichten

1. Neues Projekt auf [supabase.com](https://supabase.com) erstellen
2. SQL Schema ausführen: Kopiere den Inhalt von `supabase/schema.sql` in den SQL Editor
3. Projekt-URL und Keys notieren

### 4. ElevenLabs einrichten

1. Account auf [elevenlabs.io](https://elevenlabs.io) erstellen
2. Conversational AI Agent erstellen
3. Agent-ID notieren
4. Agent-Prompt konfigurieren (Beispiel unten)

### 5. Environment Variables

Kopiere `.env.local.example` zu `.env.local` und fülle die Werte aus:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your-agent-id
ELEVENLABS_API_KEY=your-api-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Entwicklungsserver starten

```bash
npm run dev
```

App läuft auf http://localhost:3000

## ElevenLabs Agent Prompt

Beispiel-Prompt für den ElevenLabs Conversational AI Agent:

```
Du bist ein neutraler AI Mediator. Deine Aufgabe ist es, in einem strukturierten 10-minütigen Gespräch die Perspektive eines Stakeholders zu einer Entscheidung zu erfassen.

Führe das Gespräch auf Deutsch und stelle folgende Fragen:

1. ZIELE: "Was ist Ihr wichtigstes Ziel bei dieser Entscheidung? Was möchten Sie erreichen?"

2. NO-GOS: "Gibt es etwas, das auf keinen Fall passieren darf? Was sind Ihre absoluten Grenzen?"

3. BEDENKEN: "Welche Risiken oder Bedenken haben Sie? Was könnte schiefgehen?"

4. BEDINGUNGEN: "Unter welchen Bedingungen würden Sie einer Lösung zustimmen? Was müsste erfüllt sein?"

Sei freundlich, aber sachlich. Fasse am Ende kurz zusammen, was du verstanden hast.
```

## Datenmodell

### projects
- id, title, description, decision_question
- deadline, interview_start, interview_end
- status (draft → collecting → memo_ready → commitments → completed)
- admin_email

### stakeholders
- id, project_id, name, email, role
- token (für sichere Links)
- status (invited → scheduled → interviewed → committed)
- scheduled_time

### interviews
- id, stakeholder_id, project_id
- goals, no_gos, concerns, conditions
- transcript, call_duration_seconds

### decision_memos
- id, project_id
- options (JSONB), recommendation, recommendation_rationale
- tradeoffs, open_questions

### commitments
- id, stakeholder_id, project_id
- decision (agree | block | need_change)
- comment

## API Routes

- `POST /api/generate-memo` - Generiert Decision Memo aus allen Interviews
- `POST /api/calendar` - Generiert ICS-Kalendereintrag

## Deployment

### Vercel (empfohlen)

1. Repository mit Vercel verbinden
2. Environment Variables konfigurieren
3. Deploy

### Docker

```bash
docker build -t ai-mediator .
docker run -p 3000:3000 ai-mediator
```

## Sicherheit

- Stakeholder-Links verwenden sichere 32-Zeichen-Tokens
- Supabase Row Level Security aktiviert
- Keine Passwörter gespeichert (Token-basierter Zugang)
- HTTPS in Production erforderlich

## Roadmap (nach MVP)

- [ ] E-Mail-Benachrichtigungen
- [ ] Echtzeit-Transkription
- [ ] AI-basierte Memo-Generierung (GPT-4/Claude)
- [ ] Multi-Sprachen-Support
- [ ] Slack/Teams Integration
- [ ] Export als PDF
- [ ] Admin-Authentifizierung

## Lizenz

MIT
