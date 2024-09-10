<template>
    <div class="guide-profile__service">
        <input
            type="text"
            class="form-input"
            :class="{ error: error }"
            :placeholder="$t('profile.guide.service_type')"
            maxlength="30"
            v-model="local_service.service_name"
            @input="emitUpdate">

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

    const emit = defineEmits(['update']);

    const props = defineProps({
        value: {
            type: Object,
        },
        error: {
            type: Boolean
        }
    });

    const local_service = ref({
        service_name: '',
        price: null,
        status: false
    });

    watch(() => props.value, (newVal) => {
        if (newVal) {
            local_service.value = newVal;
        }
    }, { immediate: true });

    const emitUpdate = () => {
        emit('update', local_service.value);
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
        input:first-child {
            width: 70%;
            margin-right: 0.5rem;
            text-transform: capitalize;
        }
        input:last-child {
            width: 30%;
            appearance: none;
        }
    }
</style>