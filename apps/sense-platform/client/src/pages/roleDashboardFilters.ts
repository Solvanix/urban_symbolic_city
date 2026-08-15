export function isValidKpiDateRange(startDate: string, endDate: string) {
  return !startDate || !endDate || startDate <= endDate;
}

export function buildKpiInput(startDate: string, endDate: string, category: string) {
  return {
    startAt: startDate ? new Date(`${startDate}T00:00:00`).getTime() : undefined,
    endAt: endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : undefined,
    category: category || undefined,
  };
}
