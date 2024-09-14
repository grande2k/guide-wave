<template>
    <div class="form-select" :class="{ 'form-select--active': isSelectActive, 'error': error }" ref="target">
        <div class="form-select__top" @click="isSelectActive = !isSelectActive">
            <span class="form-select__current" :class="{ 'placeholder': !currentOption }"
                v-text="currentOption?.name ?? select_placeholder" />
        </div>

        <ul class="form-select__options black-scroll">
            <li v-for="(option, index) in filteredOptions" :key="index" class="form-select__option"
                @click="chooseOption(option)" v-text="option?.name ?? option" />
        </ul>

        <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow"
            @click="isSelectActive = !isSelectActive">
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { getServices } from '@/api';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const services = ref([]);
    const isSelectActive = ref(false);
    const currentOption = ref(null);
    const target = ref(null);
    const select_placeholder = t('placeholders.service_type');

    const props = defineProps({
        value: {
            type: Object,
        },
        all_selected_services: {
            type: Array,
            required: true
        },
        error: {
            type: Boolean,
            default: false
        }
    });

    onMounted(async () => {
        services.value = await getServices('tourist');
        if (props.value && props.value.service_id && props.value.price) {
            currentOption.value = {
                name: services.value.find(s => s.id === props.value.service_id).name,
                id: props.value.service_id
            }
        }
    });

    watch(() => props.value, (newValue, oldValue) => {
        if(newValue !== oldValue) {
            const name = services.value.find(s => s.id === props.value.service_id).name;
            if(name) {
                currentOption.value = {
                    name: services.value.find(s => s.id === props.value.service_id).name,
                    id: props.value.service_id
                }
            }
        }
    }, { deep: true });

    onClickOutside(target, () => isSelectActive.value = false);

    const emit = defineEmits(['choose']);

    const filteredOptions = computed(() => {
        return services.value.filter(service => {
            return !props.all_selected_services.some(selected => selected.service_id === service.id);
        });
    });

    const chooseOption = (option) => {
        currentOption.value = option;
        emit('choose', currentOption.value.id);
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