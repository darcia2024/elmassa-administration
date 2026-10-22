/** Unknown HPP stays unknown: never treat missing costs as zero profit cost. */
export function estimateBookingMargin(total: unknown, participants: unknown, hppPerPax: unknown) {
  const cost = Number(hppPerPax);
  const pax = Number(participants);
  const revenue = Number(total);
  if (hppPerPax === null || hppPerPax === undefined || hppPerPax === "" ||
      !Number.isFinite(cost) || cost <= 0 || !Number.isInteger(pax) || pax <= 0 || !Number.isFinite(revenue)) {
    return { estimatedCost: null, estimatedMargin: null };
  }
  const estimatedCost = Math.round(cost * pax);
  return { estimatedCost, estimatedMargin: Math.round(revenue) - estimatedCost };
}
