<template>
    <button class="guide-profile__status" :class="{ 'guide-profile__status--off': !status_value }" @click="handleStatusUpdate">
        <span/>

        <p>
            {{ status_value ? $t('status_on') : $t('status_off') }}
        </p>
    </button>
</template>

<script setup>
    import { watch } from 'vue';
    import { useToggle } from '@vueuse/core';
    import { updateStatus } from '@/api';
    import { useI18n } from 'vue-i18n';
    import { useToast } from 'vue-toastification';

    const { t } = useI18n();
    const toast = useToast();
    const [status_value, toggleStatus] = useToggle();

    const props = defineProps({
        approved_status: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            required: true,
        },
        profile_valid: {
            type: Boolean,
            required: true,
        }
    });

    watch(() => props.status, (newStatus) => {
        status_value.value = newStatus;
    }, { immediate: true });

    const handleStatusUpdate = async () => {
        switch (props.approved_status) {
            case 'approved':
                if(props.profile_valid) {
                    toggleStatus();
                    const params = { status: status_value.value };
                    await updateStatus(params, t);
                } else {
                    toast(t('message_fill_profile'));
                }
                break;
            case 'not_checked':
                toast(t('message_not_approved_yet'));
                break;
            case 'declined':
                toast.error(t('message_account_declined'));
                break;
            default:
                toast.error(t('error_default'));
                break;
        }
    }
</script>

<style lang="scss" scoped>
    .guide-profile__status {
        @include flex-center-vert;
        margin-top: 0.75rem;
        border-radius: 1.75rem;
        padding: 0.5rem;
        height: 2.5rem;
        width: 6rem;
        cursor: pointer;
        background-color: $secondary;
        position: relative;
        transition: all 0.5s ease;
        user-select: none;
        span {
            position: absolute;
            display: block;
            right: 0.325rem;
            width: 1.75rem;
            height: 1.75rem;
            background-color: $white;
            border-radius: 50%;
            transition: transform 0.5s ease;
            z-index: 2;
            @media screen and (max-width: 480px) {
                width: 1.5rem;
                height: 1.5rem;
            }
        }
        p {
            position: relative;
            z-index: 1;
            color: $white;
            margin: 0;
            width: calc(100% - 2rem);
            text-align: center;
            font-size: 0.875rem;
            @media screen and (max-width: 480px) {
                font-size: 0.75rem;
                width: calc(100% - 1.5rem);
            }
        }
        &--off {
            background-color: $white;
            p {
                color: $black;
                margin-left: auto;
            }
            span {
                transform: translateX(-3.5rem);
                background-color: $black;
                @media screen and (max-width: 480px) {
                    transform: translateX(-3rem);
                }
            }
        }
        @media screen and (max-width: 480px) {
            margin-top: 0;
            margin-left: 0.75rem;
            width: 5rem;
            height: 2rem;
            padding: 0.325rem;
        }
    }
</style>