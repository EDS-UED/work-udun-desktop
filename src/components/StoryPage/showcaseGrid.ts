import type { RotatingInlineItem } from '@/components/RotatingInline/RotatingInline.vue';

function buildColumnPath(x: number) {
  const floorX = 700 + (x - 700) * 1.35;
  return `M ${x} 0 L ${x} 412 Q ${x} 500 ${floorX} 824`;
}

export const ASSET_ROTATION_ITEMS: RotatingInlineItem[] = [
  { label: 'BTC', src: '/eds-ban-btc.svg' },
  { label: 'ETH', src: '/eds-ban-eth.svg' },
  { label: 'USDT', src: '/eds-ban-udst.svg' },
  { label: 'BNB', src: '/eds-ban-bnb.svg' },
  { label: 'SOL', src: '/eds-ban-sol.svg' },
  { label: 'TRX', src: '/eds-ban-trx.svg' },
  { label: 'SUI', src: '/eds-ban-sui.svg' },
  { label: 'XRP', src: '/eds-ban-xrp.svg' },
  { label: 'USDC', src: '/eds-ban-usdc.svg' },
  { label: 'LINK', src: '/eds-ban-link.svg' },
];

export const SHOWCASE_GRID_COLUMNS = Array.from({ length: 15 }, (_, index) =>
  buildColumnPath(index * 100),
);

export const SHOWCASE_GRID_ROWS = [0, 82, 165, 247, 330, 412, 470, 540, 624, 720, 824];

export const HOME_PAGE_GRID_COLUMNS = Array.from({ length: 13 }, (_, index) =>
  buildColumnPath((index * 1400) / 12),
);

export const HOME_PAGE_GRID_ROWS = [0, 100, 200, 300, 400, 490, 595, 710, 824];
