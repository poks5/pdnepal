
export const calculateUF = (drainVolume: number, previousFillVolume: number | null, currentFillVolume: number): number => {
  if (previousFillVolume && drainVolume > 0) {
    return drainVolume - previousFillVolume;
  }
  return drainVolume - currentFillVolume;
};

export const getUFCalculationMessage = (previousFillVolume: number | null): string => {
  if (previousFillVolume) {
    return `UF calculated using previous fill volume: ${previousFillVolume}ml`;
  }
  return "UF calculated using current fill volume";
};
