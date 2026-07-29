<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { EgButton, EgIcon } from '@eds/website-components';
import { useI18n } from 'vue-i18n';
import { DOWNLOAD_URLS } from '@/utils/inviteRegister';
import { publicAsset } from '@/utils/publicAsset';
import styles from './InviteDownloadDialogs.module.css';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

const MAC_GUIDE_IMAGES = [
  publicAsset('/invite-mac-chip-guide-step1.png'),
  publicAsset('/invite-mac-chip-guide-step2.png'),
] as const;

const activeMacGuideStep = ref(0);
const macGuideImageOk = ref(true);

const macGuideSrc = computed(() => MAC_GUIDE_IMAGES[activeMacGuideStep.value]);

function selectMacGuideStep(index: number) {
  activeMacGuideStep.value = index;
  macGuideImageOk.value = true;
}

function onMacGuideError() {
  macGuideImageOk.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close');
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      activeMacGuideStep.value = 0;
      macGuideImageOk.value = true;
    }
    if (typeof document === 'undefined') return;
    if (open) {
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

function openUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="invite-download-overlay" appear>
      <div
        v-if="open"
        :class="styles.overlay"
        role="presentation"
        @click.self="emit('close')"
      >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="t('invite.macDownloadTitle')"
        :class="styles.dialog"
        data-no-corner-smoothing
      >
        <button
          type="button"
          :class="styles.close"
          :aria-label="t('invite.dialogClose')"
          @click="emit('close')"
        >
          <EgIcon name="close" size="md" />
        </button>

        <div :class="styles.dialogBody">
        <h2 :class="styles.title">{{ t('invite.macDownloadTitle') }}</h2>
        <p :class="styles.intro">{{ t('invite.macDownloadIntro') }}</p>

        <div :class="styles.macGuide">
          <div>
            <h3 :class="styles.macStepsTitle">{{ t('invite.macChipHowTo') }}</h3>
            <ol :class="styles.macStepList">
              <li :class="styles.macStepItem">
                <button
                  type="button"
                  :class="[
                    styles.macStep,
                    activeMacGuideStep === 0 && styles.macStepActive,
                  ]"
                  :aria-pressed="activeMacGuideStep === 0"
                  @click="selectMacGuideStep(0)"
                >
                  <span :class="styles.macStepIndex" aria-hidden="true">1</span>
                  <span>{{ t('invite.macChipStep1') }}</span>
                </button>
              </li>
              <li :class="styles.macStepItem">
                <button
                  type="button"
                  :class="[
                    styles.macStep,
                    activeMacGuideStep === 1 && styles.macStepActive,
                  ]"
                  :aria-pressed="activeMacGuideStep === 1"
                  @click="selectMacGuideStep(1)"
                >
                  <span :class="styles.macStepIndex" aria-hidden="true">2</span>
                  <span>{{ t('invite.macChipStep2') }}</span>
                </button>
              </li>
            </ol>
          </div>
          <img
            v-if="macGuideImageOk"
            :key="activeMacGuideStep"
            :class="styles.macGuideVisual"
            :src="macGuideSrc"
            alt=""
            loading="lazy"
            @error="onMacGuideError"
          />
          <div v-else :class="styles.macGuideVisualPlaceholder">
            {{
              activeMacGuideStep === 0
                ? t('invite.macChipStep1')
                : t('invite.macChipStep2')
            }}
          </div>
        </div>

        <div :class="styles.dialogActions" data-no-corner-smoothing>
          <div :class="styles.dialogActionItem">
            <EgButton
              type="button"
              variant="outline"
              tone="brand"
              size="md"
              @click="openUrl(DOWNLOAD_URLS.macArm)"
            >
              {{ t('invite.macDownloadArm') }}
            </EgButton>
          </div>
          <div :class="styles.dialogActionItem">
            <EgButton
              type="button"
              variant="outline"
              tone="brand"
              size="md"
              @click="openUrl(DOWNLOAD_URLS.macIntel)"
            >
              {{ t('invite.macDownloadIntel') }}
            </EgButton>
          </div>
        </div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
