<template>
    <div class="form-row" :class="{ 'able_delete': able_delete }">
        <div class="form-select" :class="{ 'form-select--active': isSelectActive, 'error': error }" ref="target">
            <div class="form-select__top" @click="toggleSelect">
                <span class="form-select__current" :class="{ 'placeholder': !currentOption }" v-text="currentOption?.name ?? select_placeholder"/>
            </div>

            <teleport to="body">
                <ul v-if="isSelectActive" class="form-select__options black-scroll" :style="dropdownPosition">
                    <li v-for="option in filteredOptions" :key="option.lang_code" class="form-select__option" @click="chooseOption(option.lang_code)">
                        {{ option.name }}
                    </li>
                </ul>
            </teleport>

            <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow" @click="isSelectActive = !isSelectActive">
        </div>

        <button v-if="able_delete" type="button" class="delete-btn" @click="emit('delete')">
            <img src="@/assets/images/icons/delete.svg" alt="delete">
        </button>
    </div>
</template>

<script setup>
    import { ref, watch, computed } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const isSelectActive = ref(false);
    const currentOption = ref(null);
    const target = ref(null);
    const select_placeholder = t('select_language');
    const dropdownPosition = ref({ top: '0px', left: '0px', width: 'auto' });

    onClickOutside(target, () => isSelectActive.value = false);

    const emit = defineEmits(['choose', 'delete']);

    const props = defineProps({
        options: {
            type: Array,
            required: true,
            default: [],
        },
        allSelectedLanguages: {
            type: Array,
            required: true,
        },
        able_delete: {
            type: Boolean,
            default: false
        },
        error: {
            type: Boolean,
            default: false
        },
        selected: {
            type: String,
        }
    });

    watch(() => props.options, (newVal) => {
        if(newVal) {
            const selectedOption = props.options.find(option => option.lang_code === props.selected);
            if(selectedOption) currentOption.value = selectedOption;
        }
    }, { immediate: true });

    watch(() => props.selected, (newVal) => {
        if (newVal) {
            const selectedOption = props.options.find(option => option.lang_code === props.selected);
            if (selectedOption) currentOption.value = selectedOption;
        }
    }, { deep: true });

    const filteredOptions = computed(() => {
        return props.options.filter(option => !props.allSelectedLanguages.includes(option.lang_code));
    });

    const toggleSelect = () => {
        isSelectActive.value = !isSelectActive.value;
        if (isSelectActive.value) {
            updateDropdownPosition();
        }
    }

    const updateDropdownPosition = () => {
        const rect = target.value.getBoundingClientRect();

        dropdownPosition.value = {
            top: `${rect.bottom + window.scrollY}px`,
            left: `${rect.left + window.scrollX}px`,
            width: `${rect.width}px`
        };
    }

    const chooseOption = (lang_code) => {
        currentOption.value = props.options.find(option => option.lang_code === lang_code);
        emit('choose', currentOption.value.lang_code);
        isSelectActive.value = false;
    }
</script>

<style lang="scss">
    .form-row {
        &:first-child {
            margin-bottom: 0.5rem;
        }
        &.able_delete {
            display: flex;
            &:not(:last-child) {
                margin-bottom: 0.5rem;
            }
            .form-select {
                flex: 0 1 85%;
                margin-bottom: 0 !important;
            }
        }
        .delete-btn {
            @include flex-center;
            background-color: $white;
            border-radius: 0.5rem;
            padding: 0.5rem;
            cursor: pointer;
            margin-left: 0.5rem;
            width: 3.5rem;
            img {
                width: 1.5rem;
                filter: invert(1);
            }
        }
    }
    .form-select {
        display: block;
        position: relative;
        background-color: $white;
        border-radius: 0.5rem;
        transition: box-shadow 0.2s ease;
        cursor: pointer;
        user-select: none;
        color: $white;
        line-height: 1.25;
        &.error {
            .form-select__top {
                border-color: $error;
            }
        }
        &:not(:last-child) {
            margin-bottom: 0.5rem;
        }
        &__arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0.5rem;
            transition: $transition;
            z-index: 2;
        }
        &__top {
            border: 2px solid transparent;
            border-radius: inherit
        }
        &__option,
        &__current {
            @include flex-center-vert;
            font-size: 1rem;
            color: $black;
            font-weight: normal;
            background-color: $white;
        }
        &__current {
            padding: 1rem 0.75rem;
            border-radius: 0.5rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
            }
            &.placeholder {
                color: #aaa;
            }
        }
        &__option {
            padding: 1rem 0.75rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
                font-size: 0.875rem;
            }
            &:hover {
                background-color: rgba($color: $primary, $alpha: 0.125);
            }
        }
        &__options {
            transition: opacity 0.3s ease;
            position: fixed;
            height: auto;
            background-color: $white;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            z-index: 3;
            max-height: 200px;
            overflow: auto;
            border-top: 1px solid $black;
            @media screen and (max-width: 480px) {
                margin-top: 2rem;
            }
        }
        &--active {
            box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            .form-select__options {
                box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            }
            .form-select__arrow {
                transform: rotate(180deg);
            }
        }
    }
</style>