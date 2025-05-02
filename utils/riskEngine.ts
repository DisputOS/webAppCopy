export function calculateRisk(description: string): number {
  // naive heuristic
  const lowRiskWords = ['delivery', 'refund'];
  const highRiskWords = ['fraud', 'scam'];
  let score = 10;
  highRiskWords.forEach(w => description.includes(w) && (score += 30));
  lowRiskWords.forEach(w => description.includes(w) && (score -= 5));
  return Math.max(0, Math.min(score, 100));
}
