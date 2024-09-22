<template>
    <div class="admin-split" v-if="split_count">
        <h2 class="admin-split__title">Исполнители в обзвоне: </h2>

        <div class="admin-split__content">
            <button class="admin-split__button" @click="handleSplitUpdate('-')">-</button>
            <span class="admin-split__count" v-text="split_count"/>
            <button class="admin-split__button" @click="handleSplitUpdate('+')">+</button>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getSplit, updateSplit } from '@/api';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const split_count = ref(null);

    onMounted(async () => {
        split_count.value = await getSplit(t);
    });

    const handleSplitUpdate = async (action) => {
        if(split_count.value > 1) {
            if (action === '-') {
                split_count.value--;
            } else {
                split_count.value++;
            }
        }

        const params = { split_by: split_count.value };
        await updateSplit(params, t);
    }
</script>

<style lang="scss" scoped>
    .admin-split {
        margin-bottom: 2rem;
        &__title {
            color: $white;
            margin: 0 0 1rem 0;
            text-align: center;
            line-height: 1;
        }
        &__content {
            @include flex-center;
        }
        &__button {
            @include flex-center;
            font-family:'Courier New', Courier, monospace;
            width: 2.5rem;
            height: 2.5rem;
            min-width: 2.5rem;
            border-radius: 50%;
            background-color: $white;
            color: $primary;
            line-height: 1;
            cursor: pointer;
            font-weight: bold;
            padding-top: 0.25rem;
            &:first-child {
                font-size: 2rem;
            }
            &:last-child {
                font-size: 1.75rem;
            }
        }
        &__count {
            margin: 0 1rem;
            color: $white;
            font-size: 1.25rem;
        }
    }
</style>