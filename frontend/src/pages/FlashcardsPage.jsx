import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Sparkles, PlusCircle, Trash2, Layers, 
  RotateCw, AlertCircle, CheckCircle2, ChevronRight, BookOpen, Clock
} from 'lucide-react';
import { subjectAPI, flashcardAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function FlashcardsPage() {
  const [subjects, setSubjects] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review'); // review, ai-generate, manage
  
  // Filter states
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // Review session states
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Manual creation states
  const [manualForm, setManualForm] = useState({
    subjectId: '',
    front: '',
    back: ''
  });
  
  // AI generation states
  const [aiSubjectId, setAiSubjectId] = useState('');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadFlashcards();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectAPI.getAll();
      setSubjects(res.data);
      if (res.data.length > 0) {
        setManualForm(prev => ({ ...prev, subjectId: res.data[0].id }));
        setAiSubjectId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load subjects', err);
    }
  };

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const res = await flashcardAPI.getAll();
      setFlashcards(res.data);
    } catch (err) {
      toast.error('Failed to load flashcards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: filter flashcards based on selected subject in view
  const filteredFlashcards = selectedSubjectId
    ? flashcards.filter(f => f.subjectId === selectedSubjectId)
    : flashcards;

  // Filter cards due for review: nextReviewDate <= current time
  const now = new Date();
  const dueFlashcards = filteredFlashcards.filter(f => {
    const reviewDate = new Date(f.nextReviewDate);
    return reviewDate <= now;
  });

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!manualForm.front.trim() || !manualForm.back.trim() || !manualForm.subjectId) {
      return toast.error('Please fill in all fields');
    }
    try {
      const res = await flashcardAPI.create(manualForm);
      toast.success('Flashcard created! 🗂️');
      setFlashcards(prev => [...prev, res.data]);
      setManualForm(prev => ({
        ...prev,
        front: '',
        back: ''
      }));
    } catch (err) {
      toast.error('Failed to create flashcard');
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Delete this flashcard?')) return;
    try {
      await flashcardAPI.delete(id);
      setFlashcards(prev => prev.filter(f => f.id !== id));
      toast.success('Flashcard deleted');
      // If we deleted card currently being reviewed, shift index
      if (reviewIndex >= dueFlashcards.length - 1) {
        setReviewIndex(Math.max(0, dueFlashcards.length - 2));
      }
    } catch (err) {
      toast.error('Failed to delete flashcard');
    }
  };

  const handleReviewScore = async (id, rating) => {
    try {
      setIsFlipped(false);
      // Wait for flip transition back to front before changing card
      setTimeout(async () => {
        const res = await flashcardAPI.review(id, rating);
        
        // Update local state item
        setFlashcards(prev => prev.map(f => f.id === id ? res.data : f));
        
        // Advance review index
        // If it was rated AGAIN, it stays in the queue. 
        // If it was GOOD/EASY, it is rescheduled and leaves the due queue immediately.
        // If due queue shrinks, make sure reviewIndex is safe
        const nextDueCount = dueFlashcards.filter(f => f.id !== id || rating === 'AGAIN').length;
        if (nextDueCount === 0) {
          setReviewIndex(0);
        } else if (reviewIndex >= nextDueCount) {
          setReviewIndex(0);
        } else if (rating !== 'AGAIN') {
          // If we completed it, due list shrinks, so index stays same but points to next card automatically.
          // Unless we were on the last card, then reset to 0.
          if (reviewIndex >= nextDueCount - 1) {
            setReviewIndex(0);
          }
        } else {
          // If AGAIN, we move to the next card in queue
          setReviewIndex((prev) => (prev + 1) % nextDueCount);
        }
        
        toast.success(`Scored as: ${rating} ✨`, { duration: 1000 });
      }, 200);
    } catch (err) {
      toast.error('Failed to update review metrics');
    }
  };

  const handleToggleChapter = (chapterName) => {
    setSelectedChapters(prev => 
      prev.includes(chapterName)
        ? prev.filter(c => c !== chapterName)
        : [...prev, chapterName]
    );
  };

  const handleGenerateAI = async () => {
    if (!aiSubjectId) return toast.error('Please select a subject');
    if (selectedChapters.length === 0) return toast.error('Select at least one chapter/topic');

    setGenerating(true);
    try {
      const res = await flashcardAPI.generateAI(aiSubjectId, selectedChapters);
      toast.success(`Successfully generated ${res.data.count} AI Flashcards! 🎓`);
      loadFlashcards();
      setActiveTab('review');
      setSelectedChapters([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  // Find currently selected AI subject's syllabus
  const aiSubject = subjects.find(s => s.id === aiSubjectId);
  const aiSyllabus = aiSubject?.syllabus || [];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary-500" />
            AI Flashcard Study Desk
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Active recall and spaced repetition (SM-2) system to lock concepts in long-term memory
          </p>
        </div>
        
        {/* Subject Filter (all tabs except AI generation which has its own dropdown) */}
        {activeTab !== 'ai-generate' && (
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-slate-500" />
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setReviewIndex(0);
                setIsFlipped(false);
              }}
              className="select-field py-2 text-xs font-bold max-w-[200px]"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.subjectName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/5 pb-0">
        {[
          { id: 'review', label: `Review Deck (${dueFlashcards.length})`, icon: Clock },
          { id: 'ai-generate', label: 'AI Flashcard Generator', icon: Sparkles },
          { id: 'manage', label: 'Manage & Manual Cards', icon: PlusCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsFlipped(false);
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all -mb-[2px] ${
                isActive
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && activeTab !== 'ai-generate' ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="min-h-[400px]">
          {/* 1. REVIEW DECK TAB */}
          {activeTab === 'review' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {dueFlashcards.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center border-emerald-500/20 dark:border-emerald-500/10 shadow-glow-emerald rounded-3xl"
                >
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Memory Deck Completed! 🎉</h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                    You have reviewed all due cards for this subject selection. Check back later or add new subjects to test yourself!
                  </p>
                  <button
                    onClick={() => setActiveTab('ai-generate')}
                    className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <Sparkles className="w-4 h-4" /> Generate More AI Cards
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>Card {reviewIndex + 1} of {dueFlashcards.length} due</span>
                    <span className="text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-full border border-primary-500/15">
                      {dueFlashcards[reviewIndex]?.Subject?.subjectName || 'Flashcard'}
                    </span>
                  </div>

                  {/* Flippable card deck container */}
                  <div className="perspective w-full h-[320px] relative">
                    <motion.div
                      key={dueFlashcards[reviewIndex]?.id}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="w-full h-full preserve-3d relative"
                    >
                      {/* FRONT OF THE CARD */}
                      <div 
                        onClick={() => setIsFlipped(true)}
                        className="absolute inset-0 backface-hidden glass-card p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none hover:border-primary-500/30 transition-all border-slate-100 bg-white dark:bg-slate-900/60"
                      >
                        <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <span>Question / Concept</span>
                          <span style={{ color: dueFlashcards[reviewIndex]?.Subject?.colorCode }}>● Active Recall</span>
                        </div>
                        <div className="max-w-md my-auto">
                          <p className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white leading-relaxed">
                            {dueFlashcards[reviewIndex]?.front}
                          </p>
                        </div>
                        <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold animate-pulse flex items-center gap-1.5 uppercase tracking-wider">
                          <RotateCw className="w-3.5 h-3.5" /> Click to reveal answer
                        </p>
                      </div>

                      {/* BACK OF THE CARD */}
                      <div 
                        onClick={() => setIsFlipped(false)}
                        className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-8 flex flex-col justify-between items-center text-center cursor-pointer select-none border-slate-100 bg-white dark:bg-slate-900/80"
                      >
                        <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <span>Answer / Explanation</span>
                          <span className="text-emerald-500">● Spaced Repetition</span>
                        </div>
                        <div className="max-w-md my-auto overflow-y-auto max-h-[170px] pr-2">
                          <p className="text-base sm:text-lg font-medium text-gray-800 dark:text-slate-100 leading-relaxed text-left whitespace-pre-line">
                            {dueFlashcards[reviewIndex]?.back}
                          </p>
                        </div>
                        <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                          <RotateCw className="w-3.5 h-3.5" /> Click to flip back
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Rating control options - visible when card is flipped */}
                  <AnimatePresence>
                    {isFlipped && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="glass-card p-5 border-white/10 dark:bg-slate-900/80 shadow-2xl flex flex-col gap-3"
                      >
                        <p className="text-xs font-bold text-center text-slate-500 uppercase tracking-widest mb-1">
                          How well did you recall this card?
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <button
                            onClick={() => handleReviewScore(dueFlashcards[reviewIndex].id, 'AGAIN')}
                            className="flex flex-col items-center p-3 rounded-2xl border border-red-500/25 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all hover:scale-105 active:scale-95 group text-red-650 dark:text-red-400 font-bold"
                          >
                            <span className="text-sm">Again</span>
                            <span className="text-[9px] font-medium opacity-80 mt-0.5 group-hover:text-white/80">Forgot (now)</span>
                          </button>
                          
                          <button
                            onClick={() => handleReviewScore(dueFlashcards[reviewIndex].id, 'HARD')}
                            className="flex flex-col items-center p-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500 hover:text-white transition-all hover:scale-105 active:scale-95 group text-amber-650 dark:text-amber-400 font-bold"
                          >
                            <span className="text-sm">Hard</span>
                            <span className="text-[9px] font-medium opacity-80 mt-0.5 group-hover:text-white/80">Struggled (1d)</span>
                          </button>

                          <button
                            onClick={() => handleReviewScore(dueFlashcards[reviewIndex].id, 'GOOD')}
                            className="flex flex-col items-center p-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 active:scale-95 group text-emerald-650 dark:text-emerald-400 font-bold"
                          >
                            <span className="text-sm">Good</span>
                            <span className="text-[9px] font-medium opacity-80 mt-0.5 group-hover:text-white/80">Ok (4d+)</span>
                          </button>

                          <button
                            onClick={() => handleReviewScore(dueFlashcards[reviewIndex].id, 'EASY')}
                            className="flex flex-col items-center p-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500 hover:text-white transition-all hover:scale-105 active:scale-95 group text-indigo-650 dark:text-indigo-400 font-bold"
                          >
                            <span className="text-sm">Easy</span>
                            <span className="text-[9px] font-medium opacity-80 mt-0.5 group-hover:text-white/80">Instant (6d+)</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* 2. AI GENERATOR TAB */}
          {activeTab === 'ai-generate' && (
            <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 shadow-xl border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Syllabus-to-Flashcards AI</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Gemini generates customized active recall decks on chosen topics</p>
                </div>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-10">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No subjects added yet</p>
                  <p className="text-xs text-slate-500 mt-1">Please add subjects with a syllabus tracker first!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Select Subject */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-2">
                      Select Subject
                    </label>
                    <select
                      value={aiSubjectId}
                      onChange={(e) => {
                        setAiSubjectId(e.target.value);
                        setSelectedChapters([]);
                      }}
                      className="select-field"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.subjectName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chapters checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400">
                        Select Chapters / Topics
                      </label>
                      {aiSyllabus.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedChapters.length === aiSyllabus.length) {
                              setSelectedChapters([]);
                            } else {
                              setSelectedChapters(aiSyllabus.map(ch => ch.name));
                            }
                          }}
                          className="text-xs text-primary-500 hover:text-primary-600 font-bold uppercase tracking-wider"
                        >
                          {selectedChapters.length === aiSyllabus.length ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    {aiSyllabus.length === 0 ? (
                      <div className="p-4 bg-slate-900/20 border border-slate-800 rounded-xl text-center">
                        <p className="text-xs text-slate-500">
                          No chapters found for this subject. Go to <strong>Subjects</strong> page and add chapters manually, or use the <strong>Syllabus Smart Import</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-2">
                        {aiSyllabus.map((ch) => {
                          const isSelected = selectedChapters.includes(ch.name);
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => handleToggleChapter(ch.name)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${
                                isSelected
                                  ? 'bg-primary-500/10 border-primary-500/30 text-primary-600 dark:text-primary-400 font-bold'
                                  : 'bg-white/40 dark:bg-slate-950/20 border-gray-150 dark:border-white/5 text-gray-700 dark:text-gray-400 hover:bg-slate-900/40'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-400'
                              }`}>
                                {isSelected && <span className="text-[10px] font-black">✓</span>}
                              </div>
                              <span className="truncate">{ch.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateAI}
                    disabled={generating || selectedChapters.length === 0}
                    className="w-full btn-primary flex items-center justify-center gap-2 font-bold shadow-md shadow-primary-500/15"
                  >
                    <Sparkles className={`w-5 h-5 text-white ${generating ? 'animate-spin' : ''}`} />
                    {generating ? 'Gemini is generating Flashcards...' : `Generate AI Flashcards (${selectedChapters.length} Chapters)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. MANAGE & MANUAL CARDS TAB */}
          {activeTab === 'manage' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form: Create manually */}
              <div className="glass-card p-6 border-white/20 h-fit">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display mb-4 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary-500" /> Create Manual Card
                </h3>
                <form onSubmit={handleCreateManual} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-1.5">Subject</label>
                    <select
                      value={manualForm.subjectId}
                      onChange={(e) => setManualForm({ ...manualForm, subjectId: e.target.value })}
                      className="select-field text-sm"
                      required
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.subjectName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-1.5">Front (Question / Concept)</label>
                    <textarea
                      placeholder="e.g. What is Avogadro's constant?"
                      value={manualForm.front}
                      onChange={(e) => setManualForm({ ...manualForm, front: e.target.value })}
                      className="input-field min-h-[80px] text-sm resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-1.5">Back (Answer / Explanation)</label>
                    <textarea
                      placeholder="e.g. 6.022 x 10^23 particles/mole. It defines the number of constituent particles in one mole of substance."
                      value={manualForm.back}
                      onChange={(e) => setManualForm({ ...manualForm, back: e.target.value })}
                      className="input-field min-h-[100px] text-sm resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary py-2.5 text-sm font-bold flex items-center justify-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Save Flashcard
                  </button>
                </form>
              </div>

              {/* Right List: Grid of all cards */}
              <div className="lg:col-span-2 glass-card p-6 border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                    Card Deck ({filteredFlashcards.length} cards)
                  </h3>
                </div>

                {filteredFlashcards.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 font-bold text-sm">No cards in this selection</p>
                    <p className="text-xs text-slate-500 mt-0.5">Use AI Generator or Manual Form to create flashcards.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredFlashcards.map((card) => (
                      <div 
                        key={card.id} 
                        className="flex flex-col sm:flex-row justify-between p-4 bg-white/45 dark:bg-slate-900/30 border border-gray-150 dark:border-white/5 rounded-2xl gap-4"
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: card.Subject?.colorCode }} 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {card.Subject?.subjectName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                              EF: {card.easeFactor?.toFixed(1)} • Reps: {card.repetitions}
                            </span>
                          </div>
                          
                          <div className="text-sm font-extrabold text-gray-950 dark:text-white">
                            Q: {card.front}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                            A: {card.back}
                          </div>
                        </div>

                        {/* Actions / Meta */}
                        <div className="flex sm:flex-col justify-between items-end gap-2.5 flex-shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-800">
                          <div className="text-right sm:text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Next Review</span>
                            <span className="text-[11px] font-bold font-mono text-slate-405 dark:text-slate-350">
                              {new Date(card.nextReviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-2.5 rounded-xl bg-red-100/70 hover:bg-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 hover:scale-105 transition-all self-end"
                            title="Delete card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
