import React, { useState, useEffect } from 'react';
import { Bot, ChevronRight, LayoutDashboard, Plus, Trash2, Loader2, PlayCircle, BarChart3, Lock, Settings } from 'lucide-react';
import { MaturityProfile, UseCaseInput, AnalysisResult } from './types';
import { DEMO_DATA } from './constants';
import AssessmentModal from './components/AssessmentModal';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import ExcelUpload from './components/ExcelUpload';
import { analyzePortfolio } from './services/aiService';

function App() {
  const [maturity, setMaturity] = useState<MaturityProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // App State
  const [useCases, setUseCases] = useState<UseCaseInput[]>([]);
  const [newUseCase, setNewUseCase] = useState<Partial<UseCaseInput>>({ title: '', department: '', description: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  // Auth State
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('google');

  // Load API Key from LocalStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('ai_app_api_key');
    const storedProvider = localStorage.getItem('ai_app_provider');
    if (storedKey) setApiKey(storedKey);
    if (storedProvider) setProvider(storedProvider);
  }, []);

  const handleSaveSettings = (key: string, prov: string) => {
    setApiKey(key);
    setProvider(prov);
    localStorage.setItem('ai_app_api_key', key);
    localStorage.setItem('ai_app_provider', prov);
  };

  const handleAssessmentComplete = (profile: MaturityProfile) => {
    setMaturity(profile);
  };

  const handleAddUseCase = () => {
    if (!newUseCase.title || !newUseCase.description) return;
    const item: UseCaseInput = {
      id: Date.now().toString(),
      title: newUseCase.title!,
      department: newUseCase.department || 'General',
      description: newUseCase.description!,
    };
    setUseCases([...useCases, item]);
    setNewUseCase({ title: '', department: '', description: '' });
  };

  const handleDeleteUseCase = (id: string) => {
    setUseCases(useCases.filter(uc => uc.id !== id));
  };

  const loadDemoData = () => {
    setUseCases([...useCases, ...DEMO_DATA]);
  };

  const handleExcelUpload = (extractedUseCases: UseCaseInput[]) => {
    setUseCases([...useCases, ...extractedUseCases]);
  };

  const runAnalysis = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (!maturity || useCases.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const data = await analyzePortfolio(maturity, useCases, apiKey, provider);
      setResults(data);
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please check your API Key and try again.');
      setIsSettingsOpen(true); // Re-open settings on failure
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setMaturity(null);
    setUseCases([]);
  };

  // View: Dashboard (Analysis Complete)
  if (results) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Dashboard results={results} onReset={handleReset} />
        </div>
      </div>
    );
  }

  // View: Main Inputs
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <Bot className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-slate-900">AI Strategic Prioritizer</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-full transition flex items-center gap-2 text-sm font-medium
              ${apiKey ? 'text-slate-500 hover:bg-slate-100' : 'text-red-500 bg-red-50 hover:bg-red-100'}
            `}
          >
            <Settings className="w-5 h-5" />
            {!apiKey && <span>Set API Key</span>}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        
        {/* Hero Section */}
        {!maturity && (
          <div className="text-center space-y-6 py-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
              Build Your <span className="text-indigo-600">AI Roadmap</span> with Confidence.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
              Assess your organization's AI maturity and let our advanced AI Consultant analyze and prioritize your use cases for maximum impact.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-1"
            >
              Start Maturity Assessment <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 1 Result: Maturity Card */}
        {maturity && (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col md:flex-row animate-fade-in">
            <div className="bg-indigo-600 p-8 md:w-1/3 text-white flex flex-col justify-center items-center text-center">
              <span className="text-indigo-200 font-medium uppercase tracking-wider text-sm mb-2">Maturity Score</span>
              <div className="text-6xl font-bold mb-2">{maturity.score}</div>
              <div className="text-2xl font-semibold bg-white/20 px-4 py-1 rounded-full">{maturity.level}</div>
            </div>
            <div className="p-8 md:w-2/3 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Assessment Complete</h3>
              <p className="text-slate-600 leading-relaxed">{maturity.summary}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">STEP 1 COMPLETE</span>
                <button onClick={() => setIsModalOpen(true)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Retake Assessment</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Use Case Input */}
        <div className={`space-y-6 transition-all duration-500 ${!maturity ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                Define Use Cases
              </h2>
              <p className="text-slate-500 mt-1">Add potential AI initiatives for your organization.</p>
            </div>
            {!maturity && <Lock className="text-slate-400 w-5 h-5" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
              <h3 className="font-semibold text-slate-900 mb-4">Add New Use Case</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input 
                    type="text" 
                    value={newUseCase.title}
                    onChange={(e) => setNewUseCase({...newUseCase, title: e.target.value})}
                    placeholder="e.g. Chatbot for Support"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                  <select
                     value={newUseCase.department}
                     onChange={(e) => setNewUseCase({...newUseCase, department: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select Department...</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                  <textarea 
                    value={newUseCase.description}
                    onChange={(e) => setNewUseCase({...newUseCase, description: e.target.value})}
                    placeholder="Briefly describe the goal..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>
                <button 
                  onClick={handleAddUseCase}
                  disabled={!newUseCase.title || !newUseCase.description}
                  className="w-full flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" /> Add to List
                </button>
                <div className="text-center">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">or</span>
                </div>
                <button
                  onClick={loadDemoData}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:bg-indigo-50 py-2 rounded-lg transition"
                >
                  Load Demo Data
                </button>
              </div>
            </div>

            {/* List */}
            <div className="md:col-span-2 space-y-4">
              {useCases.length === 0 ? (
                <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 min-h-[300px]">
                  <LayoutDashboard className="w-12 h-12 mb-2 opacity-50" />
                  <p>No use cases added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {useCases.map(uc => (
                    <div key={uc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start group hover:border-indigo-200 transition">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">{uc.department}</span>
                          <h4 className="font-semibold text-slate-900">{uc.title}</h4>
                        </div>
                        <p className="text-sm text-slate-500">{uc.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteUseCase(uc.id)}
                        className="text-slate-300 hover:text-red-500 transition p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Excel Upload - Full Width Below Grid */}
          <div className="mt-6">
            <ExcelUpload onUseCasesExtracted={handleExcelUpload} />
          </div>
        </div>

        {/* Step 3: Action */}
        <div className={`flex justify-end pt-6 border-t border-slate-200 transition-opacity ${useCases.length > 0 && maturity ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-indigo-200 transition transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-wait"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Strategy...
              </>
            ) : (
              <>
                <PlayCircle className="w-6 h-6" /> Generate Strategic Analysis
              </>
            )}
          </button>
        </div>

      </main>

      {/* Assessment Modal */}
      <AssessmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onComplete={handleAssessmentComplete} 
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialKey={apiKey}
        initialProvider={provider}
      />
    </div>
  );
}

export default App;