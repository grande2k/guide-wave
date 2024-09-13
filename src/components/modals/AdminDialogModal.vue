<template>
    <template>
        <teleport to="body">
            <div class="dialog-modal modal">
                <div class="modal__content dialog-modal__content" ref="target">
                    <div class="modal__close" @click="emit('close')">
                        <img src="@/assets/images/icons/close.svg" alt="close">
                    </div>

                    <h2 class="dialog-modal__title" v-text="content.title"/>

                    <div class="dialog-modal__buttons">
                        <button class="dialog-modal__button edit" @click="emit('edit', content.type)">
                            <img src="@/assets/images/icons/edit.svg" alt="edit">
                            Редактировать
                        </button>

                        <button class="dialog-modal__button delete" @click="emit('delete', content.type)">
                            <img src="@/assets/images/icons/delete.svg" alt="delete">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        </teleport>
    </template>
</template>

<script setup>
    import { ref } from 'vue';
    import { onClickOutside } from '@vueuse/core';

    const target = ref(null);
    
    const emit = defineEmits(['close', 'edit', 'delete']);

    onClickOutside(target, () => emit('close'));

    const props = defineProps({
        content: {
            type: Object,
            required: true
        }
    });
</script>

<style lang="scss" scoped>
    .dialog-modal {
        &__content {
            padding: 1.5rem;
        }
        &__title {
            text-align: center;
            margin: 0 0 1.25rem 0;
        }
        &__buttons {
            @include grid(2, 1rem);
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
            &.delete {
                background-color: $error;
            }
            img {
                width: 1.5rem;
                margin-right: 0.5rem;
            }
        }
    }
</style>