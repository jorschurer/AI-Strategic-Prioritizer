import React from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { AnalysisResult, AnalyzedUseCase } from '../types';
import { ArrowRight, Box, Target, Zap, AlertTriangle, Layers } from 'lucide-react';

interface DashboardProps {
  results: AnalysisResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ results, onReset }) => {
  
  const getGroupColor = (group: string) => {
    switch (group) {
      case 'Quick Wins': return '#10b981'; // Emerald
      case 'Strategic Bets': return '#6366f1'; // Indigo
      case 'Transformational': return '#f59e0b'; // Amber
      default: return '#94a3b8'; // Slate
    }
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'Quick Wins': return <Zap className="w-4 h-4" />;
      case 'Strategic Bets': return <Target className="w-4 h-4" />;
      case 'Transformational': return <Layers className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  const counts = results.analyzedUseCases.reduce((acc, curr) => {
    acc[curr.group] = (acc[curr.group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Strategic Portfolio Analysis</h2>
          <p className="text-slate-500 text-sm">AI-Generated prioritization based on your maturity profile.</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          Start New Analysis
        </button>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 p-6 rounded-2xl border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">Executive Summary</h3>
        <p className="text-slate-700 leading-relaxed">{results.executiveSummary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Chart & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-6">Prioritization Matrix</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="feasibilityScore" 
                    name="Feasibility" 
                    domain={[0, 10]} 
                    label={{ value: 'Feasibility (Low → High)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 12 }}
                    tick={{fill: '#64748b', fontSize: 12}}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="impactScore" 
                    name="Impact" 
                    domain={[0, 10]} 
                    label={{ value: 'Strategic Impact', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                    tick={{fill: '#64748b', fontSize: 12}}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as AnalyzedUseCase;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl">
                            <p className="font-bold mb-1">{data.title}</p>
                            <p className="text-slate-300">Feasibility: {data.feasibilityScore}</p>
                            <p className="text-slate-300">Impact: {data.impactScore}</p>
                            <p className="mt-1 text-indigo-300 font-medium">{data.group}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={5} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <ReferenceLine y={5} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Scatter name="Use Cases" data={results.analyzedUseCases} fill="#8884d8">
                    {results.analyzedUseCases.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getGroupColor(entry.group)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-slate-500">
              {['Quick Wins', 'Strategic Bets', 'Transformational', 'Low Priority'].map(g => (
                <div key={g} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getGroupColor(g) }}></span>
                  {g}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Breakdown */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="font-semibold text-slate-900 mb-4">Portfolio Breakdown</h3>
             <div className="space-y-3">
               {Object.entries(counts).map(([group, count]) => (
                 <div key={group} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                   <div className="flex items-center gap-2">
                     <div 
                        className="p-1.5 rounded-md text-white" 
                        style={{ backgroundColor: getGroupColor(group) }}
                      >
                       {getGroupIcon(group)}
                     </div>
                     <span className="text-sm font-medium text-slate-700">{group}</span>
                   </div>
                   <span className="text-sm font-bold text-slate-900">{count}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Detailed Cards Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Detailed Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.analyzedUseCases.map((uc) => (
            <div key={uc.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 border
                      ${uc.group === 'Quick Wins' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        uc.group === 'Strategic Bets' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        uc.group === 'Transformational' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {getGroupIcon(uc.group)} {uc.group}
                    </span>
                    <h4 className="font-bold text-lg text-slate-900 leading-tight">{uc.title}</h4>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{uc.department}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Impact</div>
                    <div className="font-bold text-slate-900">{uc.impactScore}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Feasibility</div>
                    <div className="font-bold text-slate-900">{uc.feasibilityScore}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Risk</div>
                    <div className="font-bold text-slate-900">{uc.riskScore}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg italic">
                  "{uc.reasoning}"
                </p>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Implementation Steps</h5>
                  <ul className="space-y-1">
                    {uc.implementationSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;