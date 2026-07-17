import type { RotatingInlineItem } from '@/components/RotatingInline/RotatingInline.vue';

function buildColumnPath(x: number) {
  const floorX = 700 + (x - 700) * 1.35;
  return `M ${x} 0 L ${x} 412 Q ${x} 500 ${floorX} 824`;
}

export const ASSET_ROTATION_LABELS = [
  { label: 'BTC', file: 'eds-ban-btc.svg' },
  { label: 'ETH', file: 'eds-ban-eth.svg' },
  { label: 'USDT', file: 'eds-ban-udst.svg' },
  { label: 'BNB', file: 'eds-ban-bnb.svg' },
  { label: 'SOL', file: 'eds-ban-sol.svg' },
  { label: 'TRX', file: 'eds-ban-trx.svg' },
  { label: 'SUI', file: 'eds-ban-sui.svg' },
  { label: 'XRP', file: 'eds-ban-xrp.svg' },
  { label: 'USDC', file: 'eds-ban-usdc.svg' },
  { label: 'LINK', file: 'eds-ban-link.svg' },
] as const;

export function buildAssetRotationItems(
  resolveSrc: (path: string) => string,
): RotatingInlineItem[] {
  return ASSET_ROTATION_LABELS.map(({ label, file }) => ({
    label,
    src: resolveSrc(`/${file}`),
  }));
}

export const SHOWCASE_GRID_COLUMNS = Array.from({ length: 15 }, (_, index) =>
  buildColumnPath(index * 100),
);

export const SHOWCASE_GRID_ROWS = [0, 82, 165, 247, 330, 412, 470, 540, 624, 720, 824];

export const HOME_PAGE_GRID_COLUMNS = Array.from({ length: 13 }, (_, index) =>
  buildColumnPath((index * 1400) / 12),
);

export const HOME_PAGE_GRID_ROWS = [0, 100, 200, 300, 400, 490, 595, 710, 824];
