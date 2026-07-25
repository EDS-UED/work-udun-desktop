<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import {
  EgButton,
  EgInput,
  EgLink,
  EgCheckbox,
  EgRadio,
} from '@eds/website-components';
import { useI18n } from 'vue-i18n';
import { applyThemeAttribute } from '@/composables/useTheme';
import { useNavScrollFade } from '@/composables/useNavScrollFade';
import { storeLocale, type AppLocale } from '@/i18n/locale';
import { rescanCornerSmoothing } from '@eds/website-tokens/corner-smoothing';
import {
  DOWNLOAD_URLS,
  detectClientPlatform,
  buildRegisterEmailSuggestions,
  maskRegisterEmail,
} from '@/utils/inviteRegister';
import { publicAsset } from '@/utils/publicAsset';
import DotField from './DotField.vue';
import InviteMacDownloadDialog from './InviteMacDownloadDialog.vue';
import InviteAndroidDownloadDialog from './InviteAndroidDownloadDialog.vue';
import styles from './InviteRegister.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
const CODE_LENGTH = 6;
const TAKEN_EMAILS = new Set(['registered@udun.com', 'taken@udun.com']);

const { t, locale } = useI18n();
const logoSrc = publicAsset('/udun-logo.svg');
const localeOpen = ref(false);
const localeNavRef = ref<HTMLElement | null>(null);
const localeMenuRef = ref<HTMLElement | null>(null);
const localeMenuStyle = ref<Record<string, string>>({});
let localeMenuListenersAttached = false;

type FieldKey =
  | 'email'
  | 'code'
  | 'merchantName'
  | 'password'
  | 'agreement'
  | 'form';

const form = reactive({
  email: '',
  code: '',
  merchantName: '',
  password: '',
  contactType: '' as '' | 'phone' | 'whatsapp' | 'telegram' | 'slack',
  contactValue: '',
  agreement: false,
});

const fieldErrors = reactive<Partial<Record<FieldKey, string>>>({});
const phase = ref<'form' | 'verify' | 'success'>('form');
const advancing = ref(false);
const submitting = ref(false);
const sendingCode = ref(false);
const codeCountdown = ref(0);
const merchantId = ref('');
const merchantIdCopied = ref(false);
const macDownloadOpen = ref(false);
const androidDownloadOpen = ref(false);
let countdownTimer: ReturnType<typeof setInterval> | undefined;
let copyResetTimer: ReturnType<typeof setTimeout> | undefined;

const INVITE_ACTIONS_COMPACT_MQ = '(max-width: 640px)';

const formScrollRef = ref<HTMLElement | null>(null);
const phasePanelRef = ref<HTMLElement | null>(null);
const formMainRef = ref<HTMLElement | null>(null);
const pageRootRef = ref<HTMLElement | null>(null);
const compactActions = ref(false);
const pageChromeFadeBottom = ref(false);
let compactActionsMq: MediaQueryList | undefined;
let pageChromeFadeListenersAttached = false;

function syncCompactActions() {
  compactActions.value = compactActionsMq?.matches ?? false;
  setPageChromeFadeListeners(compactActions.value);
  updatePageChromeFade();
}

function updatePageChromeFade() {
  if (!compactActions.value) {
    pageChromeFadeBottom.value = false;
    return;
  }

  const root = document.documentElement;
  const canScroll = root.scrollHeight > root.clientHeight + 1;
  pageChromeFadeBottom.value = canScroll && window.scrollY > 1;
}

function setPageChromeFadeListeners(active: boolean) {
  if (active && !pageChromeFadeListenersAttached) {
    window.addEventListener('scroll', updatePageChromeFade, { passive: true });
    window.addEventListener('resize', updatePageChromeFade);
    pageChromeFadeListenersAttached = true;
    return;
  }

  if (!active && pageChromeFadeListenersAttached) {
    window.removeEventListener('scroll', updatePageChromeFade);
    window.removeEventListener('resize', updatePageChromeFade);
    pageChromeFadeListenersAttached = false;
  }
}

const registerActionLabel = computed(() => {
  if (advancing.value) return t('invite.sendingCode');
  return compactActions.value ? t('invite.registerCompact') : t('invite.register');
});

const downloadActionLabel = computed(() =>
  compactActions.value ? t('invite.downloadCompact') : t('invite.downloadClient'),
);
const agreementWrapRef = ref<HTMLElement | null>(null);
const agreementShaking = ref(false);
const otpDigits = ref<string[]>(Array.from({ length: CODE_LENGTH }, () => ''));
const otpInputRefs = ref<Array<HTMLInputElement | null>>([]);
const otpFocusIndex = ref(0);
const { fadeTop: formFadeTop, fadeBottom: formFadeBottom, updateFade } =
  useNavScrollFade(formMainRef);

const copyrightYear = new Date().getFullYear();
const maskedEmail = computed(() => maskRegisterEmail(form.email));
const otpActiveIndex = computed(() => {
  const empty = otpDigits.value.findIndex((digit) => !digit);
  return empty === -1 ? CODE_LENGTH - 1 : empty;
});

function setOtpInputRef(el: unknown, index: number) {
  otpInputRefs.value[index] = el instanceof HTMLInputElement ? el : null;
}

function focusOtpIndex(index: number) {
  const next = Math.min(CODE_LENGTH - 1, Math.max(0, index));
  otpFocusIndex.value = next;
  void nextTick(() => {
    otpInputRefs.value[next]?.focus();
    otpInputRefs.value[next]?.select();
  });
}

function focusActiveOtp() {
  focusOtpIndex(otpActiveIndex.value);
}

function resetOtpDigits() {
  otpDigits.value = Array.from({ length: CODE_LENGTH }, () => '');
  form.code = '';
  otpFocusIndex.value = 0;
}

function applyOtpDigits(raw: string, startIndex = 0) {
  const chars = raw.replace(/\D/g, '').slice(0, CODE_LENGTH - startIndex).split('');
  if (!chars.length) return;

  const next = [...otpDigits.value];
  chars.forEach((char, offset) => {
    next[startIndex + offset] = char;
  });
  otpDigits.value = next;
  form.code = next.join('');
  clearError('code');

  const filledTo = startIndex + chars.length;
  if (filledTo >= CODE_LENGTH) {
    focusOtpIndex(CODE_LENGTH - 1);
    void completeRegister();
    return;
  }
  focusOtpIndex(filledTo);
}

function onOtpInput(index: number, event: Event) {
  if (index !== otpActiveIndex.value) {
    focusActiveOtp();
    return;
  }
  const target = event.target as HTMLInputElement;
  const digits = target.value.replace(/\D/g, '');
  if (!digits) {
    otpDigits.value[index] = '';
    form.code = otpDigits.value.join('');
    clearError('code');
    return;
  }
  if (digits.length > 1) {
    applyOtpDigits(digits, index);
    return;
  }
  otpDigits.value[index] = digits;
  form.code = otpDigits.value.join('');
  clearError('code');
  if (index < CODE_LENGTH - 1) {
    focusOtpIndex(index + 1);
  } else if (form.code.length === CODE_LENGTH) {
    void completeRegister();
  }
}

function onOtpKeydown(index: number, event: KeyboardEvent) {
  if (index !== otpActiveIndex.value) {
    event.preventDefault();
    focusActiveOtp();
    return;
  }
  if (event.key === 'Backspace') {
    if (otpDigits.value[index]) {
      otpDigits.value[index] = '';
      form.code = otpDigits.value.join('');
      clearError('code');
      return;
    }
    if (index > 0) {
      event.preventDefault();
      otpDigits.value[index - 1] = '';
      form.code = otpDigits.value.join('');
      clearError('code');
      focusOtpIndex(index - 1);
    }
    return;
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
  }
}

function onOtpFocus(index: number) {
  if (index !== otpActiveIndex.value) {
    focusActiveOtp();
    return;
  }
  otpFocusIndex.value = index;
}

function onOtpRowPointerDown() {
  focusActiveOtp();
}

function onOtpPaste(index: number, event: ClipboardEvent) {
  event.preventDefault();
  if (index !== otpActiveIndex.value) {
    focusActiveOtp();
  }
  applyOtpDigits(event.clipboardData?.getData('text') ?? '', 0);
}

async function pasteCodeFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    applyOtpDigits(text, 0);
  } catch {
    /* clipboard permission denied */
  }
}

function setLocale(nextLocale: AppLocale) {
  locale.value = nextLocale;
  /* zh-TW content is Hong Kong Traditional; tag document as zh-HK for fonts/AT */
  document.documentElement.lang = nextLocale === 'zh-TW' ? 'zh-HK' : nextLocale;
  storeLocale(nextLocale);
  localeOpen.value = false;
  (document.activeElement as HTMLElement | null)?.blur();
}

function openLocaleMenu() {
  localeOpen.value = true;
}

function closeLocaleMenu() {
  localeOpen.value = false;
}

function updateLocaleMenuPosition() {
  if (!localeOpen.value || !localeNavRef.value || !localeMenuRef.value) {
    localeMenuStyle.value = {};
    return;
  }

  const navRect = localeNavRef.value.getBoundingClientRect();
  const menu = localeMenuRef.value;
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;
  /* 横向 --spacing-2（16px）；纵向/顶栏下 --spacing-1（8px）；gap --spacing-05（4px） */
  const insetInline = 16;
  const insetBlock = 8;
  const gap = 4;

  let left = navRect.right - menuWidth;
  let top = navRect.bottom + gap;

  left = Math.max(
    insetInline,
    Math.min(left, window.innerWidth - menuWidth - insetInline),
  );
  top = Math.max(
    insetBlock,
    Math.min(top, window.innerHeight - menuHeight - insetBlock),
  );

  localeMenuStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    right: 'auto',
    transform: 'none',
  };
}

function setLocaleMenuListeners(active: boolean) {
  if (active && !localeMenuListenersAttached) {
    window.addEventListener('scroll', updateLocaleMenuPosition, true);
    window.addEventListener('resize', updateLocaleMenuPosition);
    localeMenuListenersAttached = true;
    return;
  }

  if (!active && localeMenuListenersAttached) {
    window.removeEventListener('scroll', updateLocaleMenuPosition, true);
    window.removeEventListener('resize', updateLocaleMenuPosition);
    localeMenuListenersAttached = false;
  }
}

watch(localeOpen, async (open) => {
  if (!open) {
    localeMenuStyle.value = {};
    setLocaleMenuListeners(false);
    return;
  }

  await nextTick();
  updateLocaleMenuPosition();
  setLocaleMenuListeners(true);
});

const contactOptions = computed(() => [
  { value: 'phone' as const, label: t('invite.phone') },
  { value: 'whatsapp' as const, label: 'WhatsApp' },
  { value: 'telegram' as const, label: 'Telegram' },
  { value: 'slack' as const, label: 'Slack' },
]);

const contactPlaceholder = computed(() => {
  switch (form.contactType) {
    case 'phone':
      return t('invite.phonePlaceholder');
    case 'whatsapp':
      return 'WhatsApp';
    case 'telegram':
      return 'Telegram';
    case 'slack':
      return 'Slack';
    default:
      return '';
  }
});

function selectContactType(type: typeof form.contactType, event?: Event) {
  if (form.contactType === type) {
    form.contactType = '';
    form.contactValue = '';
  } else {
    form.contactType = type;
    form.contactValue = '';
  }

  void nextTick(() => {
    const fromEvent =
      event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    const contactInput = formMainRef.value?.querySelector<HTMLElement>(
      `.${styles.contactBlock} input`,
    );
    scheduleComfortScroll(contactInput ?? fromEvent);
  });
}

const COMFORT_ZONE_THRESHOLD = 0.6;
const COMFORT_ZONE_CENTER = 0.5;
let comfortScrollTimer: ReturnType<typeof setTimeout> | undefined;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** If the interaction mid-point is below 60% of formMain, scroll it to ~50%. */
function keepFocusInComfortZone(target: Element | null) {
  const scroller = formMainRef.value;
  if (!scroller || !(target instanceof HTMLElement)) return;
  if (!scroller.contains(target)) return;

  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const midY = targetRect.top + targetRect.height / 2 - scrollerRect.top;
  if (midY <= scroller.clientHeight * COMFORT_ZONE_THRESHOLD) return;

  const delta = midY - scroller.clientHeight * COMFORT_ZONE_CENTER;
  scroller.scrollBy({
    top: delta,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
  window.setTimeout(updateFade, prefersReducedMotion() ? 0 : 360);
}

function scheduleComfortScroll(target: Element | null) {
  window.clearTimeout(comfortScrollTimer);
  comfortScrollTimer = setTimeout(() => {
    keepFocusInComfortZone(target);
  }, 0);
}

function onFormMainFocusIn(event: FocusEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  scheduleComfortScroll(target);
}

function onFormMainPointerDown(event: PointerEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const actionable = target.closest(
    'label, button, input, textarea, [role="radio"], [role="checkbox"]',
  );
  if (actionable) scheduleComfortScroll(actionable);
}

const legalLinks = computed(() => {
  if (locale.value === 'zh-CN' || locale.value === 'zh-TW') {
    return {
      terms: 'https://support.uduncloud.com/#/article-detail?groupId=105&id=87',
      privacy: 'https://support.uduncloud.com/#/article-detail?groupId=105&id=86',
    };
  }

  return {
    terms: 'https://support.uduncloud.com/#/article-detail?groupId=106&id=89',
    privacy: 'https://support.uduncloud.com/#/article-detail?groupId=106&id=88',
  };
});

const emailFieldFocused = ref(false);
const emailInputWrapRef = ref<HTMLElement | null>(null);
const emailMenuPosition = ref<{ top: string; left: string; width: string } | null>(null);
let emailMenuListenersAttached = false;

const emailSuggestions = computed(() => {
  if (!emailFieldFocused.value) return [];
  return buildRegisterEmailSuggestions(form.email);
});

const showEmailSuggestions = computed(() => {
  if (!emailFieldFocused.value) return false;
  const list = emailSuggestions.value;
  if (list.length === 0) return false;
  const current = form.email.trim();
  if (list.length === 1 && list[0] === current) return false;
  return true;
});

function onEmailFocus() {
  emailFieldFocused.value = true;
  void nextTick(updateEmailMenuPosition);
}

function onEmailBlur() {
  window.setTimeout(() => {
    emailFieldFocused.value = false;
  }, 120);
}

function updateEmailMenuPosition() {
  const wrap = emailInputWrapRef.value;
  if (!wrap || !showEmailSuggestions.value) {
    emailMenuPosition.value = null;
    return;
  }

  const rect = wrap.getBoundingClientRect();
  /* gap 2px：无 2px spacing token，硬编码；左右 8 → --spacing-1 */
  emailMenuPosition.value = {
    top: `${rect.bottom + 2}px`,
    left: `calc(${rect.left}px - var(--spacing-1))`,
    width: `calc(${rect.width}px + var(--spacing-1) * 2)`,
  };
}

function setEmailMenuListeners(active: boolean) {
  if (active && !emailMenuListenersAttached) {
    window.addEventListener('scroll', updateEmailMenuPosition, true);
    window.addEventListener('resize', updateEmailMenuPosition);
    emailMenuListenersAttached = true;
    return;
  }

  if (!active && emailMenuListenersAttached) {
    window.removeEventListener('scroll', updateEmailMenuPosition, true);
    window.removeEventListener('resize', updateEmailMenuPosition);
    emailMenuListenersAttached = false;
  }
}

watch(showEmailSuggestions, async (open) => {
  if (!open) {
    emailMenuPosition.value = null;
    setEmailMenuListeners(false);
    return;
  }

  await nextTick();
  updateEmailMenuPosition();
  setEmailMenuListeners(true);
});

watch(
  () => form.email,
  () => {
    if (showEmailSuggestions.value) {
      void nextTick(updateEmailMenuPosition);
    }
  },
);

function selectEmailSuggestion(value: string) {
  form.email = value;
  clearError('email');
  emailFieldFocused.value = false;
}

function clearError(key: FieldKey) {
  delete fieldErrors[key];
}

function clearAllErrors() {
  (Object.keys(fieldErrors) as FieldKey[]).forEach((key) => delete fieldErrors[key]);
}

function startCountdown(seconds = 60) {
  clearInterval(countdownTimer);
  codeCountdown.value = seconds;
  countdownTimer = setInterval(() => {
    codeCountdown.value -= 1;
    if (codeCountdown.value <= 0) {
      clearInterval(countdownTimer);
      codeCountdown.value = 0;
    }
  }, 1000);
}

async function onGetCodeClick(event: MouseEvent) {
  event.preventDefault();
  if (sendingCode.value || codeCountdown.value > 0) return;
  await requestVerificationCode();
}

async function requestVerificationCode(): Promise<boolean> {
  clearError('email');
  clearError('form');

  const email = form.email.trim();
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = t('invite.errors.emailFormat');
    return false;
  }

  if (TAKEN_EMAILS.has(email.toLowerCase())) {
    fieldErrors.email = t('invite.errors.emailTaken');
    return false;
  }

  sendingCode.value = true;
  await new Promise((resolve) => setTimeout(resolve, 450));
  sendingCode.value = false;
  startCountdown();
  return true;
}

function validateDetailsRequired(): boolean {
  let ok = true;
  const required: Array<[FieldKey, string]> = [
    ['email', form.email],
    ['merchantName', form.merchantName],
    ['password', form.password],
  ];

  required.forEach(([key, value]) => {
    if (!value.trim()) {
      fieldErrors[key] = t('invite.errors.required');
      ok = false;
    }
  });

  if (!form.agreement) {
    triggerAgreementShake();
    ok = false;
  }

  return ok;
}

function triggerAgreementShake() {
  agreementShaking.value = false;
  void nextTick(() => {
    agreementShaking.value = true;
    scheduleComfortScroll(agreementWrapRef.value);
  });
}

function onAgreementShakeEnd() {
  agreementShaking.value = false;
}

function validateFormats(): boolean {
  let ok = true;
  const merchantName = form.merchantName.trim();
  const password = form.password;

  if (merchantName && (merchantName.length < 2 || merchantName.length > 20)) {
    fieldErrors.merchantName = t('invite.errors.merchantName');
    ok = false;
  }

  if (password && !PASSWORD_PATTERN.test(password)) {
    fieldErrors.password = t('invite.errors.password');
    ok = false;
  }

  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    fieldErrors.email = t('invite.errors.emailFormat');
    ok = false;
  }

  return ok;
}

async function proceedToVerify() {
  clearAllErrors();

  if (!validateDetailsRequired() || !validateFormats()) {
    nextTick(() => updateFade());
    return;
  }

  if (TAKEN_EMAILS.has(form.email.trim().toLowerCase())) {
    fieldErrors.email = t('invite.errors.emailTaken');
    nextTick(() => updateFade());
    return;
  }

  advancing.value = true;
  const sent = await requestVerificationCode();
  advancing.value = false;

  if (!sent) {
    return;
  }

  form.code = '';
  resetOtpDigits();
  clearError('code');
  phase.value = 'verify';
  void nextTick(() => focusOtpIndex(0));
}

function goBackToForm() {
  clearError('code');
  resetOtpDigits();
  phase.value = 'form';
}

async function completeRegister() {
  if (submitting.value) return;
  clearAllErrors();

  /* Demo flow: any 6-digit code advances — no server-side check. */
  if (form.code.replace(/\D/g, '').length < CODE_LENGTH) return;

  submitting.value = true;
  await new Promise((resolve) => setTimeout(resolve, 400));
  merchantId.value = `${Date.now().toString().slice(-8)}`;
  submitting.value = false;
  phase.value = 'success';
}

async function copyMerchantId() {
  if (!merchantId.value || merchantIdCopied.value) return;
  try {
    await navigator.clipboard.writeText(merchantId.value);
    merchantIdCopied.value = true;
    window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(() => {
      merchantIdCopied.value = false;
    }, 2000);
  } catch {
    /* clipboard permission denied */
  }
}

function confirmSuccess() {
  void navigateTo('/');
}

function openDownload(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function onDownloadClientClick() {
  const current = detectClientPlatform();

  switch (current) {
    case 'windows':
      openDownload(DOWNLOAD_URLS.windows);
      break;
    case 'mac':
      macDownloadOpen.value = true;
      break;
    case 'ios':
      window.location.href = DOWNLOAD_URLS.appStore;
      break;
    case 'android':
      androidDownloadOpen.value = true;
      break;
    default:
      openDownload(DOWNLOAD_URLS.windows);
      break;
  }
}

function playReveal(root: HTMLElement | null) {
  if (!root) return;
  const nodes =
    root.matches('[data-reveal]')
      ? [root, ...root.querySelectorAll('[data-reveal]')]
      : [...root.querySelectorAll('[data-reveal]')];
  const unique = [...new Set(nodes)];
  unique.forEach((el) => el.classList.remove('is-visible'));
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      unique.forEach((el) => el.classList.add('is-visible'));
    });
  });
}

onMounted(() => {
  applyThemeAttribute('light');
  if (import.meta.client) {
    compactActionsMq = window.matchMedia(INVITE_ACTIONS_COMPACT_MQ);
    syncCompactActions();
    compactActionsMq.addEventListener('change', syncCompactActions);
  }
  void nextTick(() => {
    updateFade();
    playReveal(pageRootRef.value);
  });
});

watch(phase, async () => {
  await nextTick();
  formScrollRef.value?.scrollTo({ top: 0, behavior: 'auto' });
  updateFade();
  phasePanelRef.value?.classList.add('is-visible');
  if (formScrollRef.value) {
    rescanCornerSmoothing(formScrollRef.value);
  }
  if (phase.value !== 'success') {
    merchantIdCopied.value = false;
    window.clearTimeout(copyResetTimer);
  }
  void nextTick(updatePageChromeFade);
});

onBeforeUnmount(() => {
  setPageChromeFadeListeners(false);
  setLocaleMenuListeners(false);
  compactActionsMq?.removeEventListener('change', syncCompactActions);
  clearInterval(countdownTimer);
  window.clearTimeout(comfortScrollTimer);
  window.clearTimeout(copyResetTimer);
  setEmailMenuListeners(false);
});

useSeoMeta({
  title: () => t('invite.seoTitle'),
  description: () => t('invite.seoDescription'),
});

useHead({
  htmlAttrs: {
    'data-invite-page': 'true',
    'data-theme': 'light',
  },
});
</script>

<template>
  <div ref="pageRootRef" :class="styles.page">
    <div :class="styles.bgEffect" aria-hidden="true">
      <DotField
        :dot-radius="0.68"
        :dot-spacing="14"
        :bulge-strength="67"
        :glow-radius="160"
        :sparkle="false"
        :wave-amplitude="0"
        :cursor-radius="500"
        :cursor-force="0.1"
        bulge-only
        gradient-from="#b9b9aa"
        gradient-to="#d5d5cc"
        glow-color="#ffffff"
      />
    </div>
    <header
      data-reveal
      :class="[styles.pageChrome, pageChromeFadeBottom && styles.pageChromeFadeBottom]"
    >
      <a :class="styles.pageBrand" href="/" aria-label="UDun">
        <img :src="logoSrc" alt="" />
      </a>
      <div
        ref="localeNavRef"
        :class="styles.localeNav"
        @mouseenter="openLocaleMenu"
        @mouseleave="closeLocaleMenu"
      >
        <button
          type="button"
          :class="styles.localeButton"
          :aria-expanded="localeOpen"
          :aria-haspopup="true"
          :aria-label="t('common.language')"
        >
          <svg
            :class="styles.localeIcon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M14.75 8C14.75 11.7279 11.7279 14.75 8 14.75M14.75 8C14.75 4.27208 11.7279 1.25 8 1.25M14.75 8H1.25M8 14.75C4.27208 14.75 1.25 11.7279 1.25 8M8 14.75C9.55944 12.8323 10.4686 10.4684 10.5962 8C10.4686 5.53159 9.55944 3.16768 8 1.25M8 14.75C6.44056 12.8323 5.53137 10.4684 5.40385 8C5.53137 5.53159 6.44056 3.16768 8 1.25M1.25 8C1.25 4.27208 4.27208 1.25 8 1.25M1.25 7.75769H14.75"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </button>
        <div
          ref="localeMenuRef"
          :class="[styles.localeMenu, localeOpen && styles.localeMenuOpen]"
          :style="localeMenuStyle"
          role="menu"
          data-no-corner-smoothing
        >
          <button
            type="button"
            role="menuitemradio"
            :class="[styles.localeOption, locale === 'zh-CN' && styles.localeOptionActive]"
            :aria-checked="locale === 'zh-CN'"
            @click="setLocale('zh-CN')"
          >
            简体中文
          </button>
          <button
            type="button"
            role="menuitemradio"
            :class="[styles.localeOption, locale === 'zh-TW' && styles.localeOptionActive]"
            :aria-checked="locale === 'zh-TW'"
            @click="setLocale('zh-TW')"
          >
            繁体中文
          </button>
          <button
            type="button"
            role="menuitemradio"
            :class="[styles.localeOption, locale === 'en-US' && styles.localeOptionActive]"
            :aria-checked="locale === 'en-US'"
            @click="setLocale('en-US')"
          >
            English
          </button>
        </div>
      </div>
    </header>

    <section :class="styles.formColumn">
      <div
        ref="formScrollRef"
        :class="styles.formScroll"
        :data-phase="phase"
        data-no-corner-smoothing
      >
        <div
          :key="phase"
          ref="phasePanelRef"
          data-reveal
          :class="styles.phasePanel"
        >
          <template v-if="phase === 'form'">
            <header :class="styles.panelHeader">
              <h1>{{ t('invite.formTitle') }}</h1>
            </header>

            <form :class="styles.form" @submit.prevent="proceedToVerify">
            <div
              :class="[
                styles.formMainShell,
                formFadeTop && styles.formMainShellFadeTop,
                formFadeBottom && styles.formMainShellFadeBottom,
              ]"
            >
            <div
              ref="formMainRef"
              :class="styles.formMain"
              @scroll="updateFade"
              @focusin="onFormMainFocusIn"
              @pointerdown="onFormMainPointerDown"
            >
            <div :class="styles.field">
              <div :class="styles.fieldControl">
                <span class="typography-footnote-large-strong">
                  {{ t('invite.email') }}
                </span>
                <div ref="emailInputWrapRef" :class="styles.emailInputWrap">
                  <EgInput
                    v-model="form.email"
                    width-mode="full"
                    size="md"
                    control-type="email"
                    autocomplete="off"
                    :placeholder="t('invite.emailPlaceholder')"
                    :invalid="Boolean(fieldErrors.email)"
                    @focus="onEmailFocus"
                    @blur="onEmailBlur"
                    @update:model-value="clearError('email')"
                  />
                  <Teleport to="body">
                    <div
                      v-if="showEmailSuggestions && emailMenuPosition"
                      :class="styles.emailSuggestions"
                      :style="emailMenuPosition"
                      role="menu"
                      :aria-label="t('invite.email')"
                      data-no-corner-smoothing
                    >
                      <div :class="styles.emailSuggestionsList">
                        <button
                          v-for="item in emailSuggestions"
                          :key="item"
                          type="button"
                          role="menuitem"
                          :class="styles.emailSuggestionItem"
                          @mousedown.prevent="selectEmailSuggestion(item)"
                        >
                          {{ item }}
                        </button>
                      </div>
                    </div>
                  </Teleport>
                </div>
              </div>
              <small v-if="fieldErrors.email">{{ fieldErrors.email }}</small>
            </div>

            <div :class="styles.field">
              <div :class="styles.fieldControl">
                <span class="typography-footnote-large-strong">
                  {{ t('invite.merchantName') }}
                </span>
                <EgInput
                  v-model="form.merchantName"
                  width-mode="full"
                  size="md"
                  :maxlength="20"
                  :placeholder="t('invite.merchantNamePlaceholder')"
                  :invalid="Boolean(fieldErrors.merchantName)"
                  @update:model-value="clearError('merchantName')"
                />
              </div>
              <small v-if="fieldErrors.merchantName">{{ fieldErrors.merchantName }}</small>
            </div>

            <div :class="styles.field">
              <div :class="styles.fieldControl">
                <span class="typography-footnote-large-strong">
                  {{ t('invite.password') }}
                </span>
                <EgInput
                  v-model="form.password"
                  width-mode="full"
                  size="md"
                  control-type="password"
                  autocomplete="new-password"
                  :clearable="false"
                  :placeholder="t('invite.passwordPlaceholder')"
                  :invalid="Boolean(fieldErrors.password)"
                  @update:model-value="clearError('password')"
                />
              </div>
              <small v-if="fieldErrors.password">{{ fieldErrors.password }}</small>
            </div>

            <div :class="styles.contactBlock">
              <div :class="styles.contactTitle">
                <span class="typography-footnote-large-strong">{{ t('invite.contact') }}</span>
                <span class="typography-footnote-medium-strong">{{ t('invite.contactOptionalHint') }}</span>
              </div>
              <div :class="styles.contactRadios" role="radiogroup" :aria-label="t('invite.contact')">
                <EgRadio
                  v-for="option in contactOptions"
                  :key="option.value"
                  name="contactType"
                  :value="option.value"
                  size="md"
                  :model-value="form.contactType === option.value"
                  :class="styles.contactRadio"
                  @click.prevent="selectContactType(option.value, $event)"
                >
                  <span class="typography-body-small">{{ option.label }}</span>
                </EgRadio>
              </div>
              <div v-if="form.contactType" :class="styles.field">
                <div :class="styles.fieldControl">
                  <EgInput
                    v-model="form.contactValue"
                    width-mode="full"
                    size="md"
                    :control-type="form.contactType === 'phone' ? 'tel' : 'text'"
                    :placeholder="contactPlaceholder"
                  />
                </div>
              </div>
            </div>

            <div
              ref="agreementWrapRef"
              :class="[styles.agreementWrap, agreementShaking && styles.agreementShake]"
              @animationend="onAgreementShakeEnd"
            >
              <EgCheckbox
                v-model="form.agreement"
                size="md"
                :class="styles.agreement"
                @change="clearError('agreement')"
              >
                <span class="typography-footnote-large">
                  {{ t('invite.agreementPrefix') }}
                  <EgLink
                    :href="legalLinks.terms"
                    tone="brand"
                    size="md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ t('invite.terms') }}
                  </EgLink>
                  {{ t('invite.agreementAnd') }}
                  <EgLink
                    :href="legalLinks.privacy"
                    tone="brand"
                    size="md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ t('invite.privacy') }}
                  </EgLink>
                </span>
              </EgCheckbox>
            </div>
            </div>
            </div>

            <div :class="styles.actionsShell" data-no-corner-smoothing>
              <div :class="styles.actions">
              <div :class="styles.inviteActionItem">
                <EgButton
                  type="submit"
                  size="lg"
                  :loading="advancing"
                  :disabled="advancing || sendingCode"
                >
                  {{ registerActionLabel }}
                </EgButton>
              </div>
              <div :class="styles.inviteActionItem">
                <EgButton
                  type="button"
                  variant="outline"
                  tone="brand"
                  size="md"
                  @click="onDownloadClientClick"
                >
                  <template v-if="!compactActions" #icon>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 2.25v7.5m0 0L5.25 7.25M8 9.75l2.75-2.5M3.25 12.25h9.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        vector-effect="non-scaling-stroke"
                      />
                    </svg>
                  </template>
                  {{ downloadActionLabel }}
                </EgButton>
              </div>
              </div>
            </div>
          </form>
          </template>

          <template v-else-if="phase === 'verify'">
            <header :class="styles.panelHeader">
              <div :class="styles.panelTitleRow">
                <button
                  type="button"
                  :class="[styles.localeButton, styles.panelBack]"
                  :aria-label="t('invite.backToForm')"
                  @click="goBackToForm"
                >
                  <svg
                    :class="styles.panelBackIcon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M8.59375 4.53125L3.125 10L8.59375 15.4688M3.75 10H16.875"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      vector-effect="non-scaling-stroke"
                    />
                  </svg>
                </button>
                <h1>{{ t('invite.verifyTitle') }}</h1>
              </div>
              <i18n-t
                keypath="invite.verifyHint"
                tag="p"
                :class="styles.verifyHint"
              >
                <template #email>
                  <span :class="styles.verifyHintEmail">{{ maskedEmail }}</span>
                </template>
              </i18n-t>
              <div :class="styles.verifyResend">
                <EgLink
                  href="#"
                  tone="brand"
                  size="md"
                  :disabled="sendingCode || codeCountdown > 0"
                  @click="onGetCodeClick"
                >
                  {{
                    codeCountdown > 0
                      ? t('invite.resendIn', { seconds: codeCountdown })
                      : t('invite.resendCode')
                  }}
                </EgLink>
              </div>
            </header>

            <form :class="styles.form" @submit.prevent="completeRegister">
              <div
                :class="[
                  styles.formMainShell,
                  formFadeTop && styles.formMainShellFadeTop,
                  formFadeBottom && styles.formMainShellFadeBottom,
                ]"
              >
                <div
                  ref="formMainRef"
                  :class="styles.formMain"
                  @scroll="updateFade"
                >
                  <div :class="styles.field">
                    <div
                      :class="styles.otp"
                      role="group"
                      :aria-label="t('invite.code')"
                    >
                      <div :class="styles.otpRow" @pointerdown="onOtpRowPointerDown">
                        <input
                          v-for="(_, index) in otpDigits"
                          :key="index"
                          :ref="(el) => setOtpInputRef(el, index)"
                          :class="[
                            styles.otpCell,
                            otpActiveIndex === index && styles.otpCellActive,
                            otpFocusIndex === index && styles.otpCellFocused,
                          ]"
                          type="text"
                          inputmode="numeric"
                          :autocomplete="index === 0 ? 'one-time-code' : 'off'"
                          maxlength="1"
                          :value="otpDigits[index]"
                          :aria-label="`${t('invite.code')} ${index + 1}`"
                          :tabindex="otpActiveIndex === index ? 0 : -1"
                          :disabled="submitting"
                          @focus="onOtpFocus(index)"
                          @input="onOtpInput(index, $event)"
                          @keydown="onOtpKeydown(index, $event)"
                          @paste="onOtpPaste(index, $event)"
                        />
                      </div>
                      <button
                        type="button"
                        :class="styles.otpPaste"
                        :disabled="submitting"
                        @click="pasteCodeFromClipboard"
                      >
                        粘贴
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </template>

          <template v-else-if="phase === 'success'">
            <div :class="styles.success">
              <div :class="styles.successHero">
                <div :class="styles.successIcon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      :class="styles.successCheck"
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      stroke-width="2.4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h1>{{ t('invite.successTitle') }}</h1>
              </div>

              <div :class="styles.successCard">
                <div :class="styles.successRow">
                  <span :class="styles.successLabel">{{ t('invite.merchantName') }}</span>
                  <span :class="styles.successValue">{{ form.merchantName }}</span>
                </div>
                <div :class="styles.successRow">
                  <span :class="styles.successLabel">{{ t('invite.merchantId') }}</span>
                  <span :class="styles.successValue">{{ merchantId }}</span>
                  <button
                    type="button"
                    :class="styles.successCopy"
                    @click="copyMerchantId"
                  >
                    {{ merchantIdCopied ? t('invite.copied') : t('invite.copy') }}
                  </button>
                </div>
              </div>

              <div :class="styles.successActions" data-no-corner-smoothing>
                <div :class="styles.inviteActionItem">
                  <EgButton type="button" size="lg" @click="confirmSuccess">
                    {{ t('invite.confirm') }}
                  </EgButton>
                </div>
                <div :class="styles.inviteActionItem">
                  <EgButton
                    type="button"
                    variant="outline"
                    tone="brand"
                    size="md"
                    @click="onDownloadClientClick"
                  >
                    <template v-if="!compactActions" #icon>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 2.25v7.5m0 0L5.25 7.25M8 9.75l2.75-2.5M3.25 12.25h9.5"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          vector-effect="non-scaling-stroke"
                        />
                      </svg>
                    </template>
                    {{ downloadActionLabel }}
                  </EgButton>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <p data-reveal :class="styles.pageCopyright">
      © {{ copyrightYear }} UDun. {{ t('footer.rights') }}
    </p>

    <InviteMacDownloadDialog
      :open="macDownloadOpen"
      @close="macDownloadOpen = false"
    />
    <InviteAndroidDownloadDialog
      :open="androidDownloadOpen"
      @close="androidDownloadOpen = false"
    />
  </div>
</template>
