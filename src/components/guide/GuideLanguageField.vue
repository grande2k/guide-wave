<template>
    <div class="form-row" :class="{ 'able_delete': able_delete }">
        <div class="form-select" :class="{ 'form-select--active': isSelectActive, 'error': error }" ref="target">
            <div class="form-select__top" @click="toggleSelect">
                <span class="form-select__current" :class="{ 'placeholder': !currentOption }"
                    v-text="currentOption?.name ?? select_placeholder" />
            </div>

            <ul v-if="isSelectActive" class="form-select__options black-scroll">
                <li v-for="option in filteredOptions" :key="option.lang_code" class="form-select__option"
                    @click="chooseOption(option.lang_code)">
                    {{ option.name }}
                </li>
            </ul>

            <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow"
                @click="isSelectActive = !isSelectActive">
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
        if (newVal) {
            props.options.sort((a, b) => a.name.localeCompare(b.name));
            const selectedOption = props.options.find(option => option.lang_code === props.selected);
            if (selectedOption) currentOption.value = selectedOption;
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
    }

    const chooseOption = (lang_code) => {
        currentOption.value = props.options.find(option => option.lang_code === lang_code);
        emit('choose', currentOption.value.lang_code);
        isSelectActive.value = false;
    }
</script>