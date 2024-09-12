<template>
    <div class="guide-profile__service">
        <services-select
            :value="value"
            :error="error"
            :all_selected_services="all_selected_services"
            @choose="handleServiceSelect"/>

        <input
            type="text"
            class="form-input"
            :class="{ error: error }"
            :placeholder="$t('price')"
            maxlength="5"
            v-model="local_service.price"
            @input="handlePriceInput">
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { validatePrice } from '@/utils/validatePrice';
    import ServicesSelect from './ServicesSelect.vue';

    const emit = defineEmits(['update']);

    const props = defineProps({
        value: {
            type: Object,
        },
        all_selected_services: {
            type: Array,
            required: true,
        },
        error: {
            type: Boolean
        }
    });

    const local_service = ref({
        service_id: null,
        price: null,
    });

    watch(() => props.value, (newVal) => {
        if (newVal) {
            local_service.value = newVal;
        }
    }, { immediate: true });

    const emitUpdate = () => {
        emit('update', local_service.value);
    }

    const handleServiceSelect = (service) => {
        local_service.value.service_id = service.id;
        console.log(local_service.value);
    }

    const handlePriceInput = (event) => {
        local_service.value.price = +validatePrice(event.target.value);
        emitUpdate();
    }
</script>

<style lang="scss" scoped>
    .guide-profile__service {
        display: flex;
        margin-bottom: 0.5rem;
        & > *:first-child {
            width: 70%;
            margin-right: 0.5rem;
            text-transform: capitalize;
            height: 3.5rem;
        }
        input:last-child {
            height: 3.5rem;
            width: 30%;
        }
    }
</style>