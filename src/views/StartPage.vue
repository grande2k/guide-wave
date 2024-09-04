<template>
    <section class="start page">
        <router-link to="/tourist" class="start__link">{{ $t('start.tourist') }}</router-link>
        <router-link to="/login" class="start__link">{{ $t('start.guide') }}</router-link>
    </section>

    <language-picker/>
</template>

<script setup>
    import LanguagePicker from '@/components/LanguagePicker.vue';
</script>

<style lang="scss" scoped>
    .start {
        color: $white;
        &__link {
            display: block;
            background-color: $primary;
            border-radius: 1rem;
            padding: 1.5rem 2rem;
            color: $white;
            text-decoration: none;
            font-weight: 500;
            font-size: 1.5rem;
            text-align: center;
            max-width: 350px;
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            &:not(:last-child) {
                margin-bottom: 1.25rem;
            }
        }
    }
</style>