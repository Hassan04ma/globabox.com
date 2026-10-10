import React from 'react';
import { 
  Tent, 
  Flame, 
  Mountain, 
  Compass, 
  Fish, 
  Package, 
  Home, 
  Activity, 
  BadgePercent, 
  Gift, 
  MapPin, 
  Target, 
  Sparkles,
  Award,
  Backpack
} from 'lucide-react';

interface CategoryIconProps {
  categoryId: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ categoryId, className = "w-4 h-4", size }: CategoryIconProps) {
  // Map our category IDs in data.ts to professional outdoor/ecommerce Lucide icons
  switch (categoryId) {
    case 'camping':
      return <Tent className={className} size={size} />;
    case 'tentes':
      return <Tent className={className} size={size} />;
    case 'sacs_de_couchage':
      return <Backpack className={className} size={size} />;
    case 'casquettes':
      return <Award className={className} size={size} />;
    case 'chaussures':
      return <Mountain className={className} size={size} />;
    case 'rechauds':
      return <Flame className={className} size={size} />;
    case 'tables_chaises':
      return <Home className={className} size={size} />;
    case 'chasse':
      return <Target className={className} size={size} />;
    case 'peche':
      return <Fish className={className} size={size} />;
    case 'accessoires':
      return <Package className={className} size={size} />;
    case 'maison':
      return <Home className={className} size={size} />;
    case 'sport_loisirs':
      return <Activity className={className} size={size} />;
    case 'moins_99':
      return <BadgePercent className={className} size={size} />;
    case 'offres_packs':
      return <Gift className={className} size={size} />;
    default:
      return <Compass className={className} size={size} />;
  }
}
