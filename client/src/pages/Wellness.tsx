import { useState, useEffect, useCallback } from 'react'
import api from '../api'

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

  const addWater = () => {
    const current = data.nutrition.waterIntake || 0;
    updateEntry({ 
      nutrition: { ...data.nutrition, waterIntake: current + 250 } 
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-wellness"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-semibold text-text-primary">
          Wellness
        </h1>
        <p className="text-text-secondary mt-1">
          Tracking for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Section */}
        <section className="card-elevated p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-text-primary">Mood</h2>
            <span className="text-3xl" data-testid="mood-display">
              {data.mood.score >= 8 ? '😊' : data.mood.score >= 5 ? '😐' : '😔'}
            </span>
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="10"
              value={data.mood.score}
              onChange={(e) => updateEntry({ mood: { ...data.mood, score: parseInt(e.target.value) }})}
              data-testid="mood-slider"
              className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-accent-wellness"
            />
            <div className="flex justify-between text-xs text-text-secondary font-mono">
              <span>LOW</span>
              <span>NEUTRAL</span>
              <span>PEAK</span>
            </div>
          </div>
        </section>

        {/* Energy Section */}
        <section className="card-elevated p-6 space-y-6">
          <h2 className="text-xl font-heading font-semibold text-text-primary">Energy Levels</h2>
          <div className="space-y-6">
            {(['morning', 'afternoon', 'evening'] as const).map(time => (
              <div key={time} className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm text-text-secondary capitalize">{time}</label>
                  <span className="text-lg font-mono text-accent-wellness">{data.energy[time] || 5}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={data.energy[time] || 5}
                  onChange={(e) => updateEntry({ energy: { ...data.energy, [time]: parseInt(e.target.value) }})}
                  className="w-full h-1.5 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-accent-wellness"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sleep Section */}
        <section className="card-elevated p-6 space-y-6">
          <h2 className="text-xl font-heading font-semibold text-text-primary">Sleep</h2>
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-text-secondary">Duration (hours)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={data.sleep.duration || 0}
                  onChange={(e) => updateEntry({ sleep: { ...data.sleep, duration: parseFloat(e.target.value) }})}
                  data-testid="sleep-duration-input"
                  className="input-field w-24 text-center text-xl font-mono"
                />
                <span className="text-text-secondary">hrs</span>
              </div>
            </div>
            <div className="h-16 w-px bg-white/10" />
            <div className="flex-1 space-y-2">
              <label className="text-sm text-text-secondary">Quality</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono text-accent-wellness">{data.sleep.quality || 7}</span>
                <span className="text-text-secondary font-mono">/10</span>
              </div>
            </div>
          </div>
        </section>

        {/* Nutrition/Water Section */}
        <section className="card-elevated p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-text-primary">Hydration</h2>
            <span className="text-accent-wellness font-mono text-xl" data-testid="water-count">
              {data.nutrition.waterIntake || 0}ml
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-wellness shadow-[0_0_15px_rgba(110,231,183,0.3)] transition-all duration-500"
                style={{ width: `${Math.min(((data.nutrition.waterIntake || 0) / 3000) * 100, 100)}%` }}
              />
            </div>
            <button 
              onClick={addWater}
              data-testid="add-water-button"
              className="p-2 bg-accent-wellness/10 hover:bg-accent-wellness/20 text-accent-wellness rounded-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-text-secondary text-center italic">Goal: 3000ml</p>
        </section>
      </div>
    </div>
  )
}