import { useState, useEffect } from 'react';
import { X, LogOut, Trash2 } from 'lucide-react';
import { Subject } from '../types';
import { supabase } from '../lib/supabase';
import {
  ADMIN_PASSWORD,
  loadVisibilitySettings,
  saveVisibilitySettings,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from '../hooks/useAdminSettings';

interface AdminPanelProps {
  subjects: Subject[];
  onClose: () => void;
  onVisibilityChange: () => void;
}

interface NewQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

type AdminTab = 'visibility' | 'json';

export default function AdminPanel({ subjects, onClose, onVisibilityChange }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<AdminTab>('visibility');

  // Quiz publishing state
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // JSON import state
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [parsedQuiz, setParsedQuiz] = useState<{
    name: string;
    duration: number;
    passingScore: number;
    questions: NewQuestion[];
  } | null>(null);

  useEffect(() => {
    if (authenticated) {
      const settings = loadVisibilitySettings();
      const initial: Record<string, boolean> = {};
      subjects.forEach((s) => {
        initial[s.id] = s.id in settings ? settings[s.id] : (s.isActive ?? true);
      });
      setVisibility(initial);
    }
  }, [authenticated, subjects]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  }

  function handleLogout() {
    setAdminAuthenticated(false);
    setAuthenticated(false);
    onClose();
  }

  function handleToggle(id: string) {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  }

  function handleSelectAll() {
    const all: Record<string, boolean> = {};
    subjects.forEach((s) => { all[s.id] = true; });
    setVisibility(all);
    setSaved(false);
  }

  function handleDeselectAll() {
    const all: Record<string, boolean> = {};
    subjects.forEach((s) => { all[s.id] = false; });
    setVisibility(all);
    setSaved(false);
  }

  const [confirmDeleteTest, setConfirmDeleteTest] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleSave() {
    saveVisibilitySettings(visibility);
    setSaved(true);
    onVisibilityChange();
  }

  async function handleDeleteTest(subjectId: string) {
    setDeleting(true);
    try {
      // Delete questions first (foreign key dependency)
      const { error: qErr } = await supabase.from('questions').delete().eq('subject_id', subjectId);
      if (qErr) throw new Error(qErr.message);

      // Delete attempt history for this subject
      await supabase.from('attempt_history').delete().eq('subject_id', subjectId);

      // Delete the subject
      const { error: sErr } = await supabase.from('subjects').delete().eq('id', subjectId);
      if (sErr) throw new Error(sErr.message);

      setConfirmDeleteTest(null);
      onVisibilityChange();
    } catch (err) {
      console.error('Failed to delete test:', err);
    } finally {
      setDeleting(false);
    }
  }

  
  function parseJsonQuiz() {
    setJsonError('');
    setParsedQuiz(null);

    try {
      const parsed = JSON.parse(jsonInput);
      
      // Validate structure
      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Quiz must have a name');
      }
      if (!parsed.duration || typeof parsed.duration !== 'number' || parsed.duration <= 0) {
        throw new Error('Quiz must have a valid duration (minutes)');
      }
      if (!parsed.passingScore || typeof parsed.passingScore !== 'number' || parsed.passingScore < 0 || parsed.passingScore > 100) {
        throw new Error('Quiz must have a valid passing score (0-100)');
      }
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Quiz must have at least one question');
      }

      // Validate each question
      const validatedQuestions = parsed.questions.map((q: any, idx: number) => {
        if (!q.question || typeof q.question !== 'string') {
          throw new Error(`Question ${idx + 1} must have a question text`);
        }
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Question ${idx + 1} must have exactly 4 options`);
        }
        if (q.options.some((opt: any) => typeof opt !== 'string' || !opt.trim())) {
          throw new Error(`Question ${idx + 1} all options must be non-empty strings`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Question ${idx + 1} correctAnswer must be 0, 1, 2, or 3`);
        }
        return {
          question: q.question.trim(),
          options: q.options.map((opt: string) => opt.trim()),
          correctAnswer: q.correctAnswer,
          topic: q.topic ? q.topic.trim() : '',
        };
      });

      setParsedQuiz({
        name: parsed.name.trim(),
        duration: parsed.duration,
        passingScore: parsed.passingScore,
        questions: validatedQuestions,
      });
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  }

  async function applyJsonQuiz() {
    if (!parsedQuiz) return;
    
    setPublishing(true);
    setPublishMsg(null);

    try {
      // Create the subject
      const maxOrder = subjects.reduce((max, s) => Math.max(max, s.displayOrder ?? 0), 0);
      const { data: subjectData, error: subjectErr } = await supabase
        .from('subjects')
        .insert({
          name: parsedQuiz.name,
          is_active: true,
          display_order: maxOrder + 1,
          duration: parsedQuiz.duration * 60,
          passing_score: parsedQuiz.passingScore,
        })
        .select('id')
        .single();

      if (subjectErr) throw new Error(subjectErr.message);

      const subjectId = subjectData.id;

      // Insert questions
      const questionRows = parsedQuiz.questions.map((q) => ({
        subject_id: subjectId,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        topic: q.topic || null,
      }));

      const { error: questionsErr } = await supabase.from('questions').insert(questionRows);
      if (questionsErr) throw new Error(questionsErr.message);

      setPublishMsg({ type: 'success', text: `"${parsedQuiz.name}" published with ${parsedQuiz.questions.length} questions!` });
      setJsonInput('');
      setParsedQuiz(null);
      onVisibilityChange();
    } catch (err) {
      setPublishMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to publish quiz.' });
    } finally {
      setPublishing(false);
    }
  }

  
  const activeCount = Object.values(visibility).filter(Boolean).length;

  // Login screen
  if (!authenticated) {
    return (
      <div className="bg-fun flex items-center justify-center p-4">
        <div className="card-fun p-8 w-full max-w-sm animate-pop-in">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-2xl font-black text-gray-800">Admin Login</h2>
            <p className="text-sm text-gray-400 font-medium mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-candy-purple focus:border-transparent text-gray-800 font-medium"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm font-bold mt-1">{passwordError}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-3 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2 font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Authenticated admin panel
  return (
    <div className="bg-fun flex items-center justify-center p-4">
      <div className="card-fun w-full max-w-3xl animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-purple-50">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <div>
              <h2 className="text-lg font-black text-gray-800">Admin Panel</h2>
              <p className="text-xs text-gray-400 font-bold">Manage quizzes & create new ones</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 flex items-center gap-1.5 font-bold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-100"
              aria-label="Close admin panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-purple-50 px-6">
          <button
            onClick={() => setTab('visibility')}
            className={`px-4 py-3 text-sm font-bold border-b-3 transition-colors ${
              tab === 'visibility'
                ? 'border-candy-purple text-candy-purple border-b-2'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📋 Manage Quizzes
          </button>
          <button
            onClick={() => setTab('json')}
            className={`px-4 py-3 text-sm font-bold border-b-3 transition-colors ${
              tab === 'json'
                ? 'border-candy-purple text-candy-purple border-b-2'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📄 Import JSON
          </button>
        </div>

        {/* Tab content */}
        {tab === 'visibility' && (
          <>
            {/* Stats bar */}
            <div className="px-6 py-3 bg-purple-50/50 border-b-2 border-purple-50 flex items-center justify-between">
              <span className="text-sm text-gray-500 font-bold">
                <span className="text-candy-purple">{activeCount}</span> of {subjects.length} active
              </span>
              <div className="flex gap-2">
                <button onClick={handleSelectAll} className="text-xs text-candy-purple hover:text-purple-700 font-bold px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors">
                  Enable All
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={handleDeselectAll} className="text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                  Disable All
                </button>
              </div>
            </div>

            {/* Test list */}
            <div className="overflow-y-auto max-h-80 px-6 py-4 space-y-2">
              {subjects.map((subject) => {
                const active = visibility[subject.id] ?? true;
                return (
                  <div
                    key={subject.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      active ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${active ? 'bg-candy-green' : 'bg-gray-300'}`} />
                      <span className={`font-bold text-sm truncate ${active ? 'text-gray-800' : 'text-gray-400'}`}>
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {confirmDeleteTest === subject.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-red-500">Delete?</span>
                          <button
                            onClick={() => handleDeleteTest(subject.id)}
                            disabled={deleting}
                            className="text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteTest(null)}
                            className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteTest(subject.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          title={`Delete ${subject.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggle(subject.id)}
                        className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-candy-purple focus:ring-offset-1 flex-shrink-0 ${
                          active ? 'bg-candy-purple' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={active}
                        aria-label={`Toggle ${subject.name}`}
                      >
                        <span
                          className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t-2 border-purple-50 flex items-center justify-between gap-3">
              {saved && (
                <span className="text-sm text-candy-green font-bold flex items-center gap-1.5">
                  ✅ Saved!
                </span>
              )}
              {!saved && <span />}
              <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                  Close
                </button>
                <button onClick={handleSave} className="btn-primary text-sm py-2">
                  Save Changes
                </button>
              </div>
            </div>
          </>
        )}

        
        {tab === 'json' && (
          <div className="px-6 py-5 space-y-5 max-h-[32rem] overflow-y-auto">
            <div>
              <h3 className="font-black text-gray-700 mb-2">📄 Import Quiz from JSON</h3>
              <p className="text-sm text-gray-400 font-medium mb-4">Paste a JSON object with quiz details and questions below.</p>
            </div>

            {/* JSON textarea */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">JSON Data</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{
  "name": "Math Quiz - Algebra",
  "duration": 30,
  "passingScore": 70,
  "questions": [
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1,
      "topic": "Basic Addition"
    }
  ]
}'
                className="w-full h-64 px-4 py-3 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-candy-purple focus:border-transparent text-gray-800 font-mono text-sm font-medium resize-none"
              />
            </div>

            {/* Parse button */}
            <div className="flex gap-3">
              <button
                onClick={parseJsonQuiz}
                className="btn-primary text-sm py-2"
              >
                🔍 Parse & Validate
              </button>
              <button
                onClick={() => { setJsonInput(''); setJsonError(''); setParsedQuiz(null); }}
                className="px-4 py-2 text-sm font-bold text-gray-500 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Error message */}
            {jsonError && (
              <div className="p-3 rounded-2xl text-sm font-bold text-red-600 bg-red-50 border-2 border-red-200">
                ❌ {jsonError}
              </div>
            )}

            {/* Preview */}
            {parsedQuiz && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-black text-green-700">✅ Quiz Preview</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-bold text-gray-600">Name:</span> {parsedQuiz.name}</p>
                  <p><span className="font-bold text-gray-600">Duration:</span> {parsedQuiz.duration} minutes</p>
                  <p><span className="font-bold text-gray-600">Passing Score:</span> {parsedQuiz.passingScore}%</p>
                  <p><span className="font-bold text-gray-600">Questions:</span> {parsedQuiz.questions.length}</p>
                </div>
                <button
                  onClick={applyJsonQuiz}
                  className="btn-success text-sm py-2 w-full"
                >
                  ✨ Use This Quiz
                </button>
              </div>
            )}

            {/* Format help */}
            <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-4">
              <h4 className="font-black text-purple-700 mb-2">📝 JSON Format</h4>
              <pre className="text-xs text-gray-600 font-mono overflow-x-auto">
{`{
  "name": "Quiz Name",
  "duration": 30,
  "passingScore": 70,
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "topic": "Topic (optional)"
    }
  ]
}`}
              </pre>
              <p className="text-xs text-gray-400 font-medium mt-2">
                • correctAnswer: 0-3 (index of correct option)<br/>
                • topic is optional<br/>
                • All fields are required
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
