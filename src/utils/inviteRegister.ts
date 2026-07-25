export const DOWNLOAD_URLS = {
  macArm: 'https://dl.uduncloud.com/UDun-macos-aarch64.dmg',
  macIntel: 'https://dl.uduncloud.com/UDun-macos-x64.dmg',
  windows: 'https://dl.uduncloud.com/UDun-win.exe',
  android: 'https://dl.uduncloud.com/UDun-android.apk',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.uduncloud.wallet',
  appStore:
    'https://apps.apple.com/us/app/udun-wallet-3-0-%E4%BC%98%E7%9B%BE%E9%92%B1%E5%8C%85/id6787906843',
} as const;

export const CLIENT_DEEP_LINK = 'udun://login';

export const REGISTER_EMAIL_DOMAINS = [
  'qq.com',
  'foxmail.com',
  '163.com',
  'icloud.com',
  'gmail.com',
  'outlook.com',
  'yahoo.com',
] as const;

/** Suffix suggestions while typing (e.g. `11` → `11@qq.com`). */
export function buildRegisterEmailSuggestions(raw: string): string[] {
  const value = raw.trim();
  if (!value || value.includes(' ')) return [];

  const at = value.indexOf('@');
  if (at === -1) {
    return REGISTER_EMAIL_DOMAINS.map((domain) => `${value}@${domain}`);
  }

  const local = value.slice(0, at);
  const domainPart = value.slice(at + 1).toLowerCase();
  if (!local) return [];

  const matches = REGISTER_EMAIL_DOMAINS.filter((domain) => domain.startsWith(domainPart));
  return matches.map((domain) => `${local}@${domain}`);
}

/** Mask local part for verify copy, e.g. `test@gmail.com` → `t******@gmail.com`. */
export function maskRegisterEmail(email: string): string {
  const value = email.trim();
  const at = value.indexOf('@');
  if (at <= 0) return value;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!domain) return value;
  return `${local[0]}******@${domain}`;
}

export type ClientPlatform = 'mac' | 'windows' | 'android' | 'ios' | 'other';

export function detectClientPlatform(userAgent = ''): ClientPlatform {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac os x|macintosh/i.test(ua)) return 'mac';
  if (/windows/i.test(ua)) return 'windows';
  return 'other';
}

export function primaryDownloadUrl(platform: ClientPlatform): string {
  switch (platform) {
    case 'mac':
      return DOWNLOAD_URLS.macArm;
    case 'windows':
      return DOWNLOAD_URLS.windows;
    case 'android':
      return DOWNLOAD_URLS.android;
    case 'ios':
      return DOWNLOAD_URLS.appStore;
    default:
      return DOWNLOAD_URLS.windows;
  }
}
