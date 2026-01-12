import React, { useState } from 'react';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { QUESTIONS } from '../constants';
import { MaturityProfile } from '../types';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: MaturityProfile) => void;
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(0));

  if (!isOpen) return null;

  const handleSelect = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = score;
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 250);
    } else {
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = (finalAnswers: number[]) => {
    const totalScore = finalAnswers.reduce((a, b) => a + b, 0);
    const maxScore = QUESTIONS.length * 4;
    const normalizedScore = Math.round((totalScore / maxScore) * 100);

    let level: MaturityProfile['level'] = 'Novice';
    let summary = '';

    if (normalizedScore <= 25) {
      level = 'Novice';
      summary = 'Your organization is just beginning its AI journey. Focus on education and pilot projects.';
    } else if (normalizedScore <= 60) {
      level = 'Explorer';
      summary = 'You have run some experiments. It is time to standardize data and infrastructure.';
    } else if (normalizedScore <= 85) {
      level = 'Practitioner';
      summary = 'You have functional AI capabilities. Focus on scaling and governance.';
    } else {
      level = 'Expert';
      summary = 'You are an AI-first organization. Focus on cutting-edge innovation and ethics.';
    }

    onComplete({ score: normalizedScore, level, summary });
    onClose();
    // Reset for next time
    setTimeout(() => {
      setCurrentStep(0);
      setAnswers(new Array(QUESTIONS.length).fill(0));
    }, 500);
  };

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Maturity Assessment
          </h2>
          <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2">
          <div 
            className="bg-indigo-500 h-2 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1 block">
              {question.category} ({currentStep + 1}/{QUESTIONS.length})
            </span>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{question.text}</h3>
          </div>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(option.score)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group
                  ${answers[currentStep] === option.score 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${answers[currentStep] === option.score ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {option.text}
                  </span>
                  {answers[currentStep] === option.score && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 text-center">
          <p className="text-xs text-slate-500">
            Select the option that best describes your organization currently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;