import React, { useState, useEffect } from 'react';
import { X, Key, Save, AlertCircle, CheckCircle2, Loader2, ExternalLink, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, provider: string) => void;
  initialKey: string;
  initialProvider: string;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialKey,
  initialProvider
}) => {
  const [apiKey, setApiKey] = useState(initialKey);
  const [provider, setProvider] = useState(initialProvider);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Sync state if props change (e.g. initial load)
  useEffect(() => {
    setApiKey(initialKey);
    setProvider(initialProvider);
    if (initialKey) {
      setValidationStatus('valid');
    }
  }, [initialKey, initialProvider]);

  // Reset validation when key or provider changes
  useEffect(() => {
    if (apiKey !== initialKey || provider !== initialProvider) {
      setValidationStatus('idle');
      setValidationMessage('');
    }
  }, [apiKey, provider, initialKey, initialProvider]);

  if (!isOpen) return null;

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationStatus('invalid');
      setValidationMessage('Please enter an API key');
      return false;
    }

    setValidationStatus('validating');
    setValidationMessage('Validating API key...');

    try {
      if (provider === 'google') {
        // Validate Google Gemini API key with a minimal request
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: 'Say "OK" and nothing else.',
        });
        setValidationStatus('valid');
        setValidationMessage('API key is valid!');
        return true;
      } else if (provider === 'openai') {
        // Validate OpenAI API key
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        if (response.ok) {
          setValidationStatus('valid');
          setValidationMessage('API key is valid!');
          return true;
        } else {
          throw new Error('Invalid API key');
        }
      }
      return false;
    } catch (error: any) {
      setValidationStatus('invalid');
      const errorMsg = error?.message || 'Unknown error';
      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('401') || errorMsg.includes('Invalid')) {
        setValidationMessage('Invalid API key. Please check and try again.');
      } else if (errorMsg.includes('RATE_LIMIT') || errorMsg.includes('429')) {
        setValidationMessage('Rate limited. Key might be valid - try saving anyway.');
        setValidationStatus('valid');
        return true;
      } else {
        setValidationMessage(`Validation failed: ${errorMsg}`);
      }
      return false;
    }
  };

  const handleSave = async () => {
    const isValid = await validateApiKey();
    if (isValid || validationStatus === 'valid') {
      onSave(apiKey, provider);
      onClose();
    }
  };

  const getProviderInfo = () => {
    switch (provider) {
      case 'google':
        return {
          name: 'Google Gemini',
          keyLabel: 'Gemini API Key',
          placeholder: 'AIza...',
          helpUrl: 'https://aistudio.google.com/app/apikey',
          helpText: 'Get a free API key from Google AI Studio',
          description: 'Recommended for best JSON structured output support.',
        };
      case 'openai':
        return {
          name: 'OpenAI',
          keyLabel: 'OpenAI API Key',
          placeholder: 'sk-...',
          helpUrl: 'https://platform.openai.com/api-keys',
          helpText: 'Get your API key from OpenAI Platform',
          description: 'Uses GPT-4o for high-quality analysis.',
        };
      default:
        return {
          name: 'AI Provider',
          keyLabel: 'API Key',
          placeholder: 'Enter your API key',
          helpUrl: '#',
          helpText: 'Get your API key from the provider',
          description: '',
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Key className="w-5 h-5" /> API Configuration
          </h2>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* BYOK Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">Bring Your Own Key (BYOK)</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This app runs entirely in your browser. Your API key is stored locally and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">AI Provider</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('google')}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  provider === 'google'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">Google Gemini</div>
                <div className="text-xs text-slate-500 mt-1">Free tier available</div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </button>
              <button
                onClick={() => setProvider('openai')}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  provider === 'openai'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900">OpenAI</div>
                <div className="text-xs text-slate-500 mt-1">GPT-4o powered</div>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">{providerInfo.description}</p>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              {providerInfo.keyLabel}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={providerInfo.placeholder}
                className={`w-full px-4 py-3 pr-20 bg-white border-2 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition ${
                  validationStatus === 'valid'
                    ? 'border-green-300 focus:border-green-400'
                    : validationStatus === 'invalid'
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-slate-200 focus:border-indigo-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Validation Status */}
            {validationStatus !== 'idle' && (
              <div className={`flex items-center gap-2 mt-2 text-sm ${
                validationStatus === 'valid'
                  ? 'text-green-600'
                  : validationStatus === 'invalid'
                  ? 'text-red-600'
                  : 'text-slate-500'
              }`}>
                {validationStatus === 'validating' && <Loader2 className="w-4 h-4 animate-spin" />}
                {validationStatus === 'valid' && <CheckCircle2 className="w-4 h-4" />}
                {validationStatus === 'invalid' && <AlertCircle className="w-4 h-4" />}
                <span>{validationMessage}</span>
              </div>
            )}

            {/* Help Link */}
            <a
              href={providerInfo.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2 font-medium"
            >
              {providerInfo.helpText}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Privacy Notice */}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <p><strong>Privacy:</strong> Your API key is stored only in your browser's local storage.</p>
            <p><strong>Security:</strong> API calls are made directly from your browser to the AI provider.</p>
            <p><strong>Cost:</strong> You are responsible for any API usage charges from your provider.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={validateApiKey}
              disabled={!apiKey || validationStatus === 'validating'}
              className="flex-1 flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validationStatus === 'validating' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Validating...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Validate Key</>
              )}
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey || validationStatus === 'validating'}
              className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
