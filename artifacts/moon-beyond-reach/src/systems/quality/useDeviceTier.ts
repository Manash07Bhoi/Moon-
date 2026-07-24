import { useQualityStore } from '../../stores/qualityStore';

export function useDeviceTier() {
  const tier = useQualityStore((s) => s.tier);
  return tier;
}
