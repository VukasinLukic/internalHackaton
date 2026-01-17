import { User, Item, MatchScore } from '../../../domain/entities';
import { IMatchingStrategy, MatchCandidate } from '../IMatchingStrategy';
import { DomainConfig } from '../../../../config/domain.config';

export class GraphMatchingStrategy implements IMatchingStrategy {
  constructor(private config: DomainConfig) {}

  calculateMatch(seeker: User, item: Item, provider: User): MatchScore {
    const itemScore = this.calculateItemCompatibility(seeker, item);
    const providerScore = this.calculateProviderCompatibility(seeker, provider);

    const { itemCompatibility: itemWeight, providerCompatibility: providerWeight } =
      this.config.matching;

    const total = (itemScore * itemWeight) + (providerScore * providerWeight);

    const reasons = this.generateReasons(seeker, item, provider, itemScore, providerScore);

    return {
      total: Math.round(total),
      itemCompatibility: Math.round(itemScore),
      providerCompatibility: Math.round(providerScore),
      reasons
    };
  }

  private calculateItemCompatibility(seeker: User, item: Item): number {
    let score = 100;

    // Budget check (hard constraint)
    if (seeker.preferences) {
      const { min, max } = seeker.preferences.budget;
      if (item.price < min || item.price > max) {
        return 0; // Outside budget = no match
      }

      // Price sweet spot bonus (closer to min = better)
      const priceRange = max - min;
      if (priceRange > 0) {
        const pricePosition = (item.price - min) / priceRange;
        score -= pricePosition * 10; // Up to -10 points for expensive end
      }
    }

    // Location check
    if (seeker.preferences?.location.city) {
      if (item.location.city.toLowerCase() !== seeker.preferences.location.city.toLowerCase()) {
        score -= 30; // Different city penalty
      }
    }

    // Attribute matching (visual/vibe similarity)
    const seekerVibePrefs = this.inferVibePreferences(seeker);
    const itemVibes = [...item.attributes, ...item.vibes];

    const vibeOverlap = this.calculateJaccardSimilarity(seekerVibePrefs, itemVibes);
    score = score * (0.5 + vibeOverlap * 0.5); // Vibes contribute up to 50% of score

    return Math.max(0, Math.min(100, score));
  }

  private calculateProviderCompatibility(seeker: User, provider: User): number {
    let score = 50; // Start at neutral

    // Trait similarity (Jaccard)
    const traitSimilarity = this.calculateJaccardSimilarity(
      seeker.attributes,
      provider.attributes
    );
    score += traitSimilarity * 50; // Up to +50 for perfect match

    // Lifestyle compatibility
    if (seeker.preferences?.lifestyle && provider.attributes.length > 0) {
      // Check for conflicts
      if (seeker.preferences.lifestyle.smoker !== provider.attributes.includes('smoker')) {
        // One smokes, one doesn't - but check preference
        if (!seeker.preferences.lifestyle.smoker && provider.attributes.includes('smoker')) {
          score -= 20; // Non-smoker matched with smoker
        }
      }

      // Early bird vs night owl
      const seekerEarly = seeker.preferences.lifestyle.earlyBird;
      const providerEarly = provider.attributes.includes('early-bird');
      const providerNight = provider.attributes.includes('night-owl');

      if (seekerEarly && providerNight) score -= 15;
      if (!seekerEarly && providerEarly) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private inferVibePreferences(seeker: User): string[] {
    // Infer what vibes seeker might like based on their traits
    const vibes: string[] = [];

    if (seeker.attributes.includes('introvert') || seeker.attributes.includes('studious')) {
      vibes.push('quiet', 'studious', 'minimalist');
    }
    if (seeker.attributes.includes('extrovert') || seeker.attributes.includes('party-animal')) {
      vibes.push('social', 'party-friendly', 'bright');
    }
    if (seeker.attributes.includes('organized')) {
      vibes.push('modern', 'minimalist', 'bright');
    }
    if (seeker.attributes.includes('artistic')) {
      vibes.push('bohemian', 'cozy', 'rustic');
    }

    return vibes;
  }

  private calculateJaccardSimilarity(set1: string[], set2: string[]): number {
    if (set1.length === 0 && set2.length === 0) return 0.5; // Neutral

    const s1 = new Set(set1.map(s => s.toLowerCase()));
    const s2 = new Set(set2.map(s => s.toLowerCase()));

    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);

    if (union.size === 0) return 0.5;

    return intersection.size / union.size;
  }

  private generateReasons(
    seeker: User,
    item: Item,
    provider: User,
    itemScore: number,
    providerScore: number
  ): string[] {
    const reasons: string[] = [];

    // Budget reason
    if (seeker.preferences) {
      const { min, max } = seeker.preferences.budget;
      if (item.price >= min && item.price <= max) {
        reasons.push(`Within budget (€${min}-€${max})`);
      }
    }

    // Matching vibes
    const matchingVibes = item.attributes.filter(attr =>
      seeker.attributes.some(sa => sa.toLowerCase() === attr.toLowerCase())
    );
    if (matchingVibes.length > 0) {
      reasons.push(`Matching style: ${matchingVibes.slice(0, 3).join(', ')}`);
    }

    // Provider compatibility
    const matchingTraits = provider.attributes.filter(attr =>
      seeker.attributes.some(sa => sa.toLowerCase() === attr.toLowerCase())
    );
    if (matchingTraits.length > 0) {
      reasons.push(`Compatible roommate: ${matchingTraits.slice(0, 2).join(', ')}`);
    }

    // Location
    if (seeker.preferences?.location.city?.toLowerCase() === item.location.city.toLowerCase()) {
      reasons.push(`In your preferred area: ${item.location.city}`);
    }

    // Score-based reasons
    if (itemScore >= 80) {
      reasons.push('Great apartment match!');
    }
    if (providerScore >= 70) {
      reasons.push('Highly compatible roommate');
    }

    return reasons.slice(0, 4); // Max 4 reasons
  }

  findBestMatches(
    seeker: User,
    candidates: MatchCandidate[],
    limit: number
  ): Array<{ candidate: MatchCandidate; score: MatchScore }> {
    const scored = candidates.map(candidate => ({
      candidate,
      score: this.calculateMatch(seeker, candidate.item, candidate.provider)
    }));

    // Filter by minimum threshold
    const filtered = scored.filter(
      s => s.score.total >= this.config.matching.minScoreThreshold
    );

    // Sort by total score descending
    filtered.sort((a, b) => b.score.total - a.score.total);

    return filtered.slice(0, limit);
  }
}
