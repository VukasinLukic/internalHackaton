import { DomainConfig, DomainType } from '../domain.config';
import { zzzimeriConfig } from './zzzimeri.config';

const configs: Record<DomainType, DomainConfig> = {
  zzzimeri: zzzimeriConfig,
  tradey: zzzimeriConfig // TODO: Create tradey config later
};

export function loadDomainConfig(): DomainConfig {
  const domainType = (process.env.DOMAIN_TYPE || 'zzzimeri') as DomainType;

  const config = configs[domainType];
  if (!config) {
    throw new Error(`Unknown domain type: ${domainType}`);
  }

  console.log(`✅ Loaded domain config: ${domainType}`);
  return config;
}

export { DomainConfig, DomainType };
