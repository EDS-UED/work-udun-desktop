<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { EgButton, EgIcon } from '@eds/website-components';
import { useI18n } from 'vue-i18n';
import { DOWNLOAD_URLS } from '@/utils/inviteRegister';
import styles from './InviteDownloadDialogs.module.css';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close');
}

watch(
  () => props.open,
  (open) => {
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
    <div
      v-if="open"
      :class="styles.overlay"
      role="presentation"
      @click.self="emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="t('invite.androidDownloadTitle')"
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
        <h2 :class="styles.title">{{ t('invite.androidDownloadTitle') }}</h2>
        <p :class="styles.intro">{{ t('invite.androidDownloadIntro') }}</p>

        <div :class="styles.androidActions" data-no-corner-smoothing>
          <div :class="styles.dialogActionItem">
            <EgButton
              type="button"
              variant="outline"
              tone="brand"
              size="md"
              @click="openUrl(DOWNLOAD_URLS.googlePlay)"
            >
              {{ t('invite.androidDownloadPlay') }}
            </EgButton>
          </div>
          <div :class="styles.dialogActionItem">
            <EgButton
              type="button"
              variant="outline"
              tone="brand"
              size="md"
              @click="openUrl(DOWNLOAD_URLS.android)"
            >
              {{ t('invite.androidDownloadApk') }}
            </EgButton>
          </div>
        </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
