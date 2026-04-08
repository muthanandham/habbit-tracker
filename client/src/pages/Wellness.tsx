import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Sparkles, Activity, Droplets, Moon, Battery, Smile, Meh, Frown, History as HistoryIcon } from 'lucide-react'

import { ModuleIcon } from '../components/ModuleIcon'

interface WellnessData {
  _id?: string
  date: string
  mood: {
    score: number
    emotions: string[]
  }
  energy: {
    morning?: number
    afternoon?: number
    evening?: number
  }
  sleep: {
    duration?: number
    quality?: number
  }
  nutrition: {
    waterIntake?: number
  }
}

export default function Wellness() {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState<WellnessData>({
    date: today,
    mood: { score: 5, emotions: [] },
    energy: { morning: 5, afternoon: 5, evening: 5 },
    sleep: { duration: 8, quality: 7 },
    nutrition: { waterIntake: 0 }
  })
  const [loading, setLoading] = useState(true)

  const wellnessTemplates = {
    mind: {
      title: 'Mind & Focus',
      items: [
        { name: "Meditate 10m", icon: "meditate", desc: "Mindfulness" },
        { name: "Breathwork", icon: "breathwork", desc: "Regulation" },
        { name: "Watch Sunrise", icon: "sunrise", desc: "Circadian" },
        { name: "Log 3 Gratitudes", icon: "gratitude", desc: "Positivity" },
        { name: "Walk in Nature", icon: "nature", desc: "Grounding" },
        { name: "Digital Detox 1hr", icon: "detox", desc: "Focus" }
      ]
    },
    recovery: {
      title: 'Active Recovery',
      items: [
        { name: "Take a Bath", icon: "bath", desc: "Relaxation" },
        { name: "Evening Stretch", icon: "stretch", desc: "Tension" },
        { name: "Read Fiction", icon: "reading", desc: "Screen-Free" },
        { name: "Family Time", icon: "family", desc: "Connection" },
        { name: "Calming Music", icon: "music", desc: "Auditory" },
        { name: "Herbal Tea", icon: "tea", desc: "Digestion" },
        { name: "Cold Plunge", icon: "cold", desc: "Metabolic" }
      ]
    },
    sleep: {
      title: 'Sleep Hygiene',
      items: [
        { name: "No Blue Light", icon: "bluelight", desc: "Melatonin" },
        { name: "Magnesium", icon: "magnesium", desc: "Deep Rest" },
        { name: "Cool Room Temp", icon: "cool", desc: "Phase Shift" },
        { name: "Eye Mask", icon: "eyemask", desc: "Total Dark" },
        { name: "White Noise", icon: "whitenoise", desc: "Soundscape" }
      ]
    },
    energy: {
      title: 'Energy Systems',
      items: [
        { name: "B-Complex", icon: "energy", desc: "Metabolism" },
        { name: "Sunlight Exposure", icon: "sunlight", desc: "Alertness" },
        { name: "Power Nap", icon: "nap", desc: "Reset" },
        { name: "Smart Caffeine", icon: "caffeine", desc: "Timing" }
      ]
    }
  };
  type WellnessCategory = keyof typeof wellnessTemplates;
  const [activeCategory, setActiveCategory] = useState<WellnessCategory>('mind');
  const fetchTodayData = useCallback(async () => {
    try {
      const res = await api.get(`/wellness/date/${today}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch wellness data', error);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchTodayData();
  }, [fetchTodayData]);

  useEffect(() => {
    const handleEntityUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ entity?: string }>;
      if (customEvent.detail?.entity === 'wellness') {
        fetchTodayData();
      }
    };

    window.addEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
    return () => window.removeEventListener('lifeos:entity-updated', handleEntityUpdated as EventListener);
  }, [fetchTodayData]);

  const updateEntry = async (updates: Partial<WellnessData>) => {
    try {
      // Optimistic update
      const newData = { ...data, ...updates };
      setData(newData);
      
      // Save to backend
      await api.patch(`/wellness/date/${today}`, updates);
    } catch (error) {
      console.error('Failed to update wellness', error);
      // Revert if failed? (For simplicity, we'll just log)
    }
  }


  const addPresetHabit = async (name: string, icon: string, desc: string) => {
    try {
      await api.post('/habits', {
        name,
        icon,
        description: desc,
        frequency: 'daily',
        category: 'mindfulness'
      });
      window.dispatchEvent(new CustomEvent('lifeos:entity-updated', { detail: { entity: 'habits' } }));
      // Optional: Add a small toast notification here if you eventually implement global toasts
    } catch (error) {
      console.error('Failed to add preset habit', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-wellness"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary">
            Wellness
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/history?filter=wellness" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-bright transition-all">
            <HistoryIcon size={16} />


            <span className="hidden xs:inline">History</span>
          </Link>
        </div>
      </div>

      {/* Contextual Banner */}
      {(data?.mood?.score || 5) < 5 && (
        <div className="p-5 rounded-2xl bg-accent-wellness/5 border border-accent-wellness/20 flex items-start gap-4">
          <div className="p-2 bg-accent-wellness/10 rounded-full text-accent-wellness mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-lg">It looks like a heavy day.</h3>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed max-w-2xl">
              When your mood is lower than usual, focusing on simple, grounding self-care works best. Consider clicking an activity below like a short walk or meditation to gently reset your baseline.
            </p>
          </div>
        </div>
      )}

      {/* Daily Vitals Dashboard */}
      <section className="card-elevated p-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-8 flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-wellness" />
          Daily Vitals
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          
          {/* Mood Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Smile className="w-4 h-4" /> Mood Quality
              </label>
              <span className="text-2xl" title={(data?.mood?.score || 5).toString()}>
                {(data?.mood?.score || 5) >= 8 ? <Smile className="w-6 h-6 text-accent-wellness" /> : (data?.mood?.score || 5) >= 5 ? <Meh className="w-6 h-6 text-accent-wellness opacity-70" /> : <Frown className="w-6 h-6 text-red-400" />}
              </span>
            </div>
            <div className="flex gap-1 h-8 w-full group">
              {[...Array(10)].map((_, i) => {
                const score = i + 1;
                const isActive = score <= (data?.mood?.score || 5);
                return (
                  <button
                    key={score}
                    onClick={() => updateEntry({ mood: { ...(data?.mood || {emotions: []}), score }})}
                    className={`flex-1 rounded-sm transition-all duration-300 ${
                      isActive 
                        ? 'bg-accent-wellness shadow-[0_0_8px_rgba(110,231,183,0.3)]' 
                        : 'bg-bg-lowered group-hover:bg-bg-elevated/50'
                    } hover:!bg-accent-wellness hover:opacity-80`}
                  />
                );
              })}
            </div>
          </div>

          {/* Average Energy */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Battery className="w-4 h-4" /> Energy Levels (Avg)
              </label>
              <span className="text-lg font-mono text-accent-wellness">
                {Math.round((((data?.energy?.morning) || 5) + ((data?.energy?.afternoon) || 5) + ((data?.energy?.evening) || 5)) / 3)}/10
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['morning', 'afternoon', 'evening'] as const).map(time => (
                <div key={time} className="flex flex-col items-center bg-bg-surface/50 rounded-xl p-2 border border-border-subtle">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted mb-2">{time.substring(0,3)}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const current = data?.energy?.[time] || 5;
                        updateEntry({ energy: { ...(data?.energy || {}), [time]: Math.max(1, current - 1) }});
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-lowered hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >-</button>
                    <span className="w-4 text-center font-mono font-medium">{data?.energy?.[time] || 5}</span>
                    <button 
                      onClick={() => {
                        const current = data?.energy?.[time] || 5;
                        updateEntry({ energy: { ...(data?.energy || {}), [time]: Math.min(10, current + 1) }});
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-bg-lowered hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Moon className="w-4 h-4" /> Sleep
              </label>
               <div className="flex items-center gap-3 bg-bg-surface/50 rounded-xl p-1.5 border border-border-subtle">
                <button 
                  onClick={() => {
                    const current = data?.sleep?.duration || 0;
                    updateEntry({ sleep: { ...(data?.sleep || {}), duration: Math.max(0, current - 0.5) }});
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-lowered hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >-</button>
                <div className="flex items-baseline gap-1 min-w-[3rem] justify-center">
                  <span className="text-xl font-mono text-text-primary">{data?.sleep?.duration || 0}</span>
                  <span className="text-[10px] text-text-muted pb-0.5">hrs</span>
                </div>
                <button 
                  onClick={() => {
                    const current = data?.sleep?.duration || 0;
                    updateEntry({ sleep: { ...(data?.sleep || {}), duration: Math.min(24, current + 0.5) }});
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-lowered hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >+</button>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-text-muted mb-2">
                <span>Poor</span>
                <span>Quality</span>
                <span>Excellent</span>
              </div>
               <div className="flex gap-1 h-3 w-full group">
                {[...Array(10)].map((_, i) => {
                  const qual = i + 1;
                  const isActive = qual <= (data?.sleep?.quality || 7);
                  return (
                    <button
                      key={qual}
                      onClick={() => updateEntry({ sleep: { ...(data?.sleep || {}), quality: qual }})}
                      className={`flex-1 rounded-[1px] transition-all duration-300 ${
                        isActive 
                          ? 'bg-accent-wellness shadow-[0_0_5px_rgba(110,231,183,0.3)]' 
                          : 'bg-bg-lowered group-hover:bg-bg-elevated/50'
                      } hover:!bg-accent-wellness hover:opacity-80`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className="space-y-4">
             <div className="flex justify-between items-end mb-3">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Droplets className="w-4 h-4" /> Hydration
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-accent-wellness font-mono text-xl">
                  {data?.nutrition?.waterIntake || 0}
                </span>
                <span className="text-xs text-text-muted">/ 3000ml</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 gap-2">
              {[...Array(12)].map((_, i) => {
                const mlValue = (i + 1) * 250;
                const currentIntake = data?.nutrition?.waterIntake || 0;
                const isFull = currentIntake >= mlValue;
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (currentIntake === mlValue) {
                        updateEntry({ nutrition: { ...(data?.nutrition || {}), waterIntake: mlValue - 250 }});
                      } else {
                         updateEntry({ nutrition: { ...(data?.nutrition || {}), waterIntake: mlValue }});
                      }
                    }}
                    title={`${mlValue}ml`}
                    className={`aspect-square flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer border ${
                      isFull
                        ? 'bg-accent-wellness/20 border-accent-wellness/40 text-accent-wellness scale-105 shadow-[0_0_10px_rgba(110,231,183,0.2)]'
                        : 'bg-bg-surface border-border-subtle text-text-muted hover:border-accent-wellness/30 hover:text-accent-wellness/50'
                    }`}
                  >
                    <Droplets className={`transition-all duration-300 ${isFull ? 'w-5 h-5 fill-current' : 'w-4 h-4'}`} />
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </section>

      {/* Wellness Presets (Tabbed) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider px-1">
            Self-Care Presets
          </h2>
          <div className="flex gap-2 bg-bg-surface/50 p-1.5 rounded-full border border-border-subtle inline-flex overflow-x-auto hide-scrollbar">
            {(Object.keys(wellnessTemplates) as WellnessCategory[]).map(key => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === key
                    ? 'bg-accent-wellness/20 text-accent-wellness shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                }`}
              >
                {wellnessTemplates[key].title}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in" key={activeCategory}>
          {wellnessTemplates[activeCategory].items.map(preset => (
            <button
              key={preset.name}
              onClick={() => addPresetHabit(preset.name, preset.icon, preset.desc)}
              className="flex flex-col items-start justify-center p-6 rounded-2xl bg-bg-surface border border-border-subtle hover:bg-bg-elevated hover:border-accent-wellness/50 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-md cursor-pointer overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ModuleIcon name={preset.icon} size={80} module="wellness" />
              </div>
              <div className="mb-4 p-3 rounded-xl bg-bg-lowered border border-border-subtle group-hover:border-accent-wellness/30 group-hover:bg-accent-wellness/5 transition-all">
                <ModuleIcon name={preset.icon} size={24} module="wellness" />
              </div>
              <span className="text-sm font-semibold text-text-primary text-left leading-tight group-hover:text-accent-wellness transition-colors">{preset.name}</span>
              <span className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-mono">{preset.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
