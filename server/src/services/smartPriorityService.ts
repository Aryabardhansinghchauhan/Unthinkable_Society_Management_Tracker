import { COMPLAINT_PRIORITY } from '../config/constants';

export interface PrioritySuggestion {
  priority: (typeof COMPLAINT_PRIORITY)[keyof typeof COMPLAINT_PRIORITY];
  reason: string;
  confidenceScore: number;
}

const HIGH_PRIORITY_KEYWORDS = [
  'leak',
  'leaking',
  'flood',
  'flooding',
  'spark',
  'short circuit',
  'smoke',
  'fire',
  'stuck',
  'trap',
  'trapped',
  'lift stuck',
  'elevator stuck',
  'no water',
  'gas leak',
  'sewage',
  'overflow',
  'electric shock',
  'power outage',
  'blackout',
  'emergency',
  'danger',
  'hazard',
];

const LOW_PRIORITY_KEYWORDS = [
  'paint',
  'scratch',
  'cosmetic',
  'garden',
  'plant',
  'trim',
  'parking line',
  'signboard',
  'bulb',
  'light bulb',
  'dust',
  'sweeping',
  'aesthetic',
  'minor',
  'stain',
];

export const suggestPriority = (
  category: string,
  title: string,
  description: string
): PrioritySuggestion => {
  const combinedText = `${title} ${description}`.toLowerCase();

  // 1. Lift emergencies or critical safety concerns
  if (
    category === 'Lift' ||
    combinedText.includes('lift') ||
    combinedText.includes('elevator')
  ) {
    if (
      combinedText.includes('stuck') ||
      combinedText.includes('trap') ||
      combinedText.includes('door not opening') ||
      combinedText.includes('jerk') ||
      combinedText.includes('fall')
    ) {
      return {
        priority: COMPLAINT_PRIORITY.HIGH,
        reason: 'Lift entrapment or malfunction involves immediate resident safety.',
        confidenceScore: 0.95,
      };
    }
  }

  // 2. High priority keyword matches (Water flooding, electrical fire, etc.)
  for (const keyword of HIGH_PRIORITY_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      if (category === 'Plumbing' && (keyword.includes('leak') || keyword.includes('flood') || keyword.includes('overflow'))) {
        return {
          priority: COMPLAINT_PRIORITY.HIGH,
          reason: 'Active water leakage or flooding can cause rapid structural and property damage.',
          confidenceScore: 0.9,
        };
      }
      if (category === 'Electrical' && (keyword.includes('spark') || keyword.includes('shock') || keyword.includes('smoke') || keyword.includes('power'))) {
        return {
          priority: COMPLAINT_PRIORITY.HIGH,
          reason: 'Electrical hazards carry a direct risk of fire or electric shock.',
          confidenceScore: 0.9,
        };
      }
      if (category === 'Security') {
        return {
          priority: COMPLAINT_PRIORITY.HIGH,
          reason: 'Security breaches directly impact society safety and access control.',
          confidenceScore: 0.85,
        };
      }
      return {
        priority: COMPLAINT_PRIORITY.HIGH,
        reason: `Urgent indicator ("${keyword}") detected in request details.`,
        confidenceScore: 0.8,
      };
    }
  }

  // 3. Low priority keyword matches
  for (const keyword of LOW_PRIORITY_KEYWORDS) {
    if (combinedText.includes(keyword)) {
      return {
        priority: COMPLAINT_PRIORITY.LOW,
        reason: `Cosmetic or routine maintenance indicator ("${keyword}") identified.`,
        confidenceScore: 0.75,
      };
    }
  }

  if (category === 'Parking' || category === 'Cleaning') {
    return {
      priority: COMPLAINT_PRIORITY.LOW,
      reason: `Routine ${category.toLowerCase()} requests are usually handled during standard maintenance cycles.`,
      confidenceScore: 0.7,
    };
  }

  // 4. Default standard priority
  return {
    priority: COMPLAINT_PRIORITY.MEDIUM,
    reason: 'Standard maintenance issue with typical society resolution timeframe.',
    confidenceScore: 0.6,
  };
};
