<template>
    <div class="translation-group">
        <div v-for="(value, key) in translations" :key="key" class="translation-item">
            <div v-if="isObject(value)" class="translation-object">
                <label class="translation-object-title">{{ key }}</label>
                <TranslationFields :translations="value" v-model="translations[key]" />
            </div>

            <div v-else>
                <label :for="key">{{ key }}</label>
                <input class="form-input" v-model="translations[key]" :id="key" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { watch } from 'vue';

    const props = defineProps({
        translations: {
            type: Object,
            required: true,
        }
    });

    const emit = defineEmits(['update:modelValue']);

    watch(() => props.translations, (newTranslations) => {
        emit('update:modelValue', newTranslations);
    }, { deep: true });

    const isObject = (value) => {
        return typeof value === 'object' && value !== null;
    };
</script>

<style lang="scss" scoped>
    .translation-item {
        margin-bottom: 0.75rem;
    }
    label {
        display: block;
        color: $white;
        margin-bottom: 0.325rem;
    }
    .translation-object {
        padding: 1rem 0;
        border-top: 1px solid $white;
        border-bottom: 1px solid $white;
        &-title {
            font-weight: bold;
            margin-bottom: 1rem;
        }
    }
</style>