<template>
    <div class="form-row">
        <div class="form-select" :class="{ 'form-select--active': isSelectActive }" ref="target">
            <div class="form-select__top" @click="toggleSelect">
                <span class="form-select__current" :class="{ 'placeholder': !selectedLanguages.length }">
                    <span v-if="selectedLanguages.length" v-text="selectedLanguages.map(option => option.name).join(', ')" />
                    <span v-else v-text="select_placeholder" />
                </span>
            </div>

            <ul v-if="isSelectActive" class="form-select__options black-scroll" ref="dropdown">
                <li v-for="option in filteredOptions" :key="option.lang_code" class="form-select__option" :class="{ active: isSelected(option.lang_code) }" @click="toggleLanguage(option.lang_code)">
                    <span class="checkbox">
                        <img v-if="isSelected(option.lang_code)" src="@/assets/images/icons/check.svg" alt="check">
                    </span>
                    {{ option.name }}
                </li>
            </ul>

            <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow" @click="isSelectActive = !isSelectActive">
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const isSelectActive = ref(false);
    const selectedLanguages = ref([]);
    const target = ref(null);
    const dropdown = ref(null);
    const select_placeholder = t('select_language');

    onClickOutside(target, (event) => {
        if (dropdown.value && dropdown.value.contains(event.target)) return;
        isSelectActive.value = false;
    });

    const emit = defineEmits(['choose']);

    const props = defineProps({
        options: {
            type: Array,
            required: true,
            default: [],
        },
        allSelectedLanguages: {
            type: Array,
            required: true,
        }
    });

    const filteredOptions = computed(() => {
        return props.options.filter(option => !props.allSelectedLanguages.includes(option.lang_code));
    });

    const toggleSelect = () => {
        isSelectActive.value = !isSelectActive.value;
    }

    const isSelected = (lang_code) => {
        return selectedLanguages.value.some(option => option.lang_code === lang_code);
    }

    const toggleLanguage = (lang_code) => {
        const index = selectedLanguages.value.findIndex(option => option.lang_code === lang_code);

        if (index === -1) {
            const selectedOption = props.options.find(option => option.lang_code === lang_code);
            selectedLanguages.value.push(selectedOption);
        } else {
            selectedLanguages.value.splice(index, 1);
        }

        emit('choose', selectedLanguages.value.map(option => option.lang_code));
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
            border-radius: inherit;
        }
        &__option,
        &__current {
            @include flex-center-vert;
            font-size: 1rem;
            color: $black;
            font-weight: normal;
            background-color: $white;
            cursor: pointer;
        }
        &__current {
            padding: 1rem 0.75rem;
            border-radius: 0.5rem;
            max-width: 95%;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
            }
            &.placeholder {
                color: #aaa;
            }
        }
        &__option {
            @include flex-center-vert;
            padding: 1rem 0.75rem;
            cursor: pointer;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
                font-size: 0.875rem;
            }
            .checkbox {
                @include flex-center;
                width: 1.25rem;
                height: 1.25rem;
                border-radius: 1rem;
                background-color: #c5c5c5;
                margin-right: 0.5rem;
                img {
                    width: 0.75rem;
                }
            }
            &.active {
                .checkbox {
                    background-color: $primary;
                }
            }
            &:hover {
                background-color: rgba($color: $primary, $alpha: 0.125);
            }
        }
        &__options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 100;
            box-shadow: -2px 4px 8px rgba($color: $black, $alpha: 0.5);
            transition: opacity 0.3s ease;
            height: auto;
            background-color: $white;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            max-height: 200px;
            overflow: auto;
            border-top: 1px solid $black;
            @media screen and (max-width: 480px) {
                max-height: 170px;
            }
        }
        &--active {
            box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            .form-select__arrow {
                transform: rotate(180deg);
            }
        }
    }
</style>