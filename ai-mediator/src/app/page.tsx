import Link from 'next/link';
import { ArrowRight, Users, FileText, CheckCircle, Mic } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">AI Mediator</h1>
          <Link
            href="/admin"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Stakeholder Alignment durch KI-gestützte Gespräche
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Ein neutraler AI Agent führt 1:1 Gespräche mit jedem Stakeholder,
            sammelt Ziele, Bedenken und No-Gos, und erstellt automatisch ein
            Decision Memo mit klaren Empfehlungen.
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Neues Projekt starten
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            So funktioniert es
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary-600" />}
              title="1. Stakeholder einladen"
              description="Laden Sie alle relevanten Stakeholder mit personalisierten Links ein."
            />
            <FeatureCard
              icon={<Mic className="h-8 w-8 text-primary-600" />}
              title="2. KI-Gespräche"
              description="Jeder Stakeholder führt ein 10-minütiges Voice-Gespräch mit dem AI Mediator."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-primary-600" />}
              title="3. Decision Memo"
              description="Das System generiert automatisch ein Memo mit Optionen und Empfehlungen."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-primary-600" />}
              title="4. Commitments"
              description="Stakeholder geben ihr Commitment ab: Zustimmung, Blockade oder Änderungswunsch."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          AI Mediator MVP - Stakeholder Alignment Tool
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-xl mb-4">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
