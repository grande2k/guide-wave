<template>
    <div class="modal new-password">
        <div class="modal__content admin-modal__content" ref="target">
            <div class="modal__close" @click="emit('close')">
                <img src="@/assets/images/icons/close.svg" alt="close">
            </div>

            <h2 class="new-password__title" v-text="$t('new_password')"/>

            <p class="new-password__text">{{ $t('your_new_password') }} {{ new_password }}</p>

            <div class="new-password__buttons">
                <button class="new-password__button edit" @click="emit('edit')">
                    {{ $t('edit') }}
                </button>

                <button class="new-password__button close" @click="emit('close')">
                    {{ $t('close') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { onClickOutside } from '@vueuse/core';

    const target = ref(null);
    const emit = defineEmits(['close', 'edit']);

    onClickOutside(target, () => emit('close'));

    defineProps({
        new_password: {
            type: String,
            required: true
        }
    });
</script>

<style lang="scss" scoped>
    .new-password {
        &__title {
            text-align: center;
            font-size: 1.75rem;
            margin: 0 0 2rem 0;
        }
        &__text {
            text-align: center;
            margin: 0 0 2rem 0;
            font-size: 1.25rem;
        }
        &__buttons {
            @include grid(2, 1rem);
            @media screen and (max-width: 480px) {
                grid-template-columns: 1fr;
            }
        }
        &__button {
            @include flex-center;
            width: 100%;
            padding: 1.25rem;
            border-radius: 1rem;
            color: $white;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            &.edit {
                background-color: $primary;
            }
            &.close {
                background-color: $error;
            }
        }
    }
</style>