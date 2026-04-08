import React from 'react';
import { 
  Flower, Wind, Sunrise, Heart, Trees, 
  Waves, BookOpen, Users, Music, Coffee, Snowflake, 
  Moon, Smartphone, Pill, ThermometerSnowflake, EyeOff, 
  Sun, Bed, CupSoda, Book, Dumbbell, Droplets, Footprints, 
  Activity, Beef, MoveUp, CheckCircle, Circle,

  Zap, Target, PenTool, Hash, AlertTriangle, ShieldCheck,
  Search, BarChart3, Receipt, Newspaper, PhoneCall, Gift,
  Smile, Meh, Frown, Award, LucideProps
} from 'lucide-react';



export type IconName = string;

interface ModuleIconProps extends LucideProps {
  name: IconName;
  module?: 'habit' | 'task' | 'wellness' | 'assistant' | 'other';
  size?: number;
}

const iconMap: Record<string, React.FC<LucideProps>> = {
  // Wellness / Mind
  'meditate': Flower,
  'breathwork': Wind,
  'sunrise': Sunrise,
  'gratitude': Heart,
  'nature': Trees,
  'detox': Smartphone,
  'smartphone': Smartphone,
  'device': Smartphone,


  
  // Recovery
  'bath': Waves,
  'stretch': Activity,
  'reading': BookOpen,
  'family': Users,
  'music': Music,
  'tea': Coffee,
  'cold': Snowflake,
  
  // Sleep
  'sleep': Moon,
  'bluelight': Smartphone,
  'magnesium': Pill,
  'cool': ThermometerSnowflake,
  'eyemask': EyeOff,
  'whitenoise': Waves,
  
  // Energy
  'sunlight': Sun,
  'nap': Bed,
  'caffeine': CupSoda,
  
  // Habits / Productivity
  'book': Book,
  'gym': Dumbbell,
  'water': Droplets,
  'run': Footprints,
  'steps': Activity,
  'protein': Beef,
  'posture': MoveUp,
  'plan': Zap,
  'journal': PenTool,
  'skill': Zap,
  'energy': Sunrise,


  
  // Social
  'call': PhoneCall,
  'compliment': Award,
  'kindness': Gift,

  
  // Wealth
  'budget': BarChart3,
  'spend': Hash,
  'expenses': Receipt,
  'news': Newspaper,
  'wealth': BarChart3,


  // Moods
  'smile': Smile,
  'meh': Meh,
  'frown': Frown,
  
  // Defaults
  'default': Target,
  'done': CheckCircle,
  'todo': Circle,

  'urgent': AlertTriangle,
  'discipline': ShieldCheck,
  'search': Search
};

/**
 * Centered Icon Component that maps labels/emojis to formal Lucide icons
 */
export const ModuleIcon: React.FC<ModuleIconProps> = ({ 
  name, 
  module = 'other', 
  size = 20, 
  className = '', 
  ...props 
}) => {
  const normalizedName = name.toLowerCase().replace(/\s+/g, '');
  
  // Try to find exact match, then substring match
  let IconComponent = iconMap[normalizedName];
  
  if (!IconComponent) {
    const key = Object.keys(iconMap).find(k => normalizedName.includes(k));
    IconComponent = key ? iconMap[key] : iconMap['default'];
  }

  const moduleColors = {
    habit: 'text-accent-habit',
    task: 'text-accent-task',
    wellness: 'text-accent-wellness',
    assistant: 'text-accent-assistant',
    other: 'text-text-secondary'
  };

  return (
    <IconComponent 
      size={size} 
      strokeWidth={1.5}
      className={`${moduleColors[module]} ${className}`} 
      {...props}
    />
  );
};
