<template>
    <div class="form-select" :class="{ 'form-select--active': isSelectActive, 'error': error }" ref="target">
        <div class="form-select__top" @click="isSelectActive = !isSelectActive">
            <span class="form-select__current" :class="{ 'placeholder': !currentOption }"
                v-text="currentOption ?? select_placeholder" />
        </div>

        <ul class="form-select__options black-scroll">
            <li v-for="(option, index) in filteredOptions" :key="index" class="form-select__option"
                @click="chooseOption(option)" v-text="option" />
        </ul>

        <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow"
            @click="isSelectActive = !isSelectActive">
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
    const select_placeholder = t('placeholders.service_type');

    onClickOutside(target, () => isSelectActive.value = false);

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
        },
        error: {
            type: Boolean,
            default: false
        }
    });

    const filteredOptions = computed(() => {
        return props.options.filter(option => !props.allSelectedLanguages.includes(option));
    });

    const chooseOption = (option) => {
        currentOption.value = option;
        emit('choose', currentOption);
        isSelectActive.value = false;
    }
</script>

<style lang="scss" scoped>
    .form-select {
        &__option,
        &__current {
            text-transform: capitalize;
        }
    }
</style>