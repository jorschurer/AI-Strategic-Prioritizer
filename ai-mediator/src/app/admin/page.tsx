'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { FolderOpen, Users, FileText, ArrowRight, Plus } from 'lucide-react';
import type { Project, Stakeholder, Interview, Commitment } from '@/types/database';

interface ProjectWithStats extends Project {
  stakeholder_count: number;
  interviews_count: number;
  commitments_count: number;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const supabase = createClient();

      // Load projects with counts
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Load stakeholder counts per project
      const projectsWithStats = await Promise.all(
        ((projectsData || []) as Project[]).map(async (project) => {
          const { count: stakeholderCount } = await supabase
            .from('stakeholders')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          const { count: interviewsCount } = await supabase
            .from('interviews')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          const { count: commitmentsCount } = await supabase
            .from('commitments')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          return {
            ...project,
            stakeholder_count: stakeholderCount || 0,
            interviews_count: interviewsCount || 0,
            commitments_count: commitmentsCount || 0,
          };
        })
      );

      setProjects(projectsWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-600">Fehler: {error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Bitte stellen Sie sicher, dass Supabase korrekt konfiguriert ist.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          icon={<FolderOpen className="h-6 w-6 text-primary-600" />}
          label="Projekte"
          value={projects.length}
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          label="Stakeholder gesamt"
          value={projects.reduce((sum, p) => sum + p.stakeholder_count, 0)}
        />
        <StatCard
          icon={<FileText className="h-6 w-6 text-green-600" />}
          label="Interviews durchgeführt"
          value={projects.reduce((sum, p) => sum + p.interviews_count, 0)}
        />
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Projekte</h2>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Noch keine Projekte
              </h3>
              <p className="text-gray-500 mb-4">
                Erstellen Sie Ihr erstes Projekt, um Stakeholder einzuladen.
              </p>
              <Link href="/admin/projects/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Projekt erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center space-x-4">
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: ProjectWithStats }) {
  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {project.title}
              </h3>
              <Badge status={project.status} />
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {project.decision_question}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Deadline: {formatDate(project.deadline)}</span>
              <span>{project.stakeholder_count} Stakeholder</span>
              <span>{project.interviews_count} Interviews</span>
              <span>{project.commitments_count} Commitments</span>
            </div>
          </div>
          <Link href={`/admin/projects/${project.id}`}>
            <Button variant="secondary" size="sm">
              Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
