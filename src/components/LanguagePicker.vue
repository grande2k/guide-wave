<template>
    <div class="language-picker" :class="{ 'language-picker--active': isPickerActive }">
        <div class="language-picker__language language-picker__language--current" @click="isPickerActive = !isPickerActive">
            <div class="language-picker__flag">
                <img :src="images[`${currentLanguage.name}-flag`]" alt="flag">
            </div>
            <span class="language-picker__langName" v-text="currentLanguage.name" />
        </div>

        <ul class="language-picker__list">
            <li v-for="lang in filteredLanguages" :key="lang.id" class="language-picker__language"
                @click="switchLanguage(lang.name)">
                <div class="language-picker__flag">
                    <img :src="images[`${lang.name}-flag`]" alt="flag">
                </div>

                <span class="language-picker__langName" v-text="lang.name" />
            </li>
        </ul>

        <img src="@/assets/images/icons/arrow-down.svg" class="language-picker__arrow" alt="arrow" @click="isPickerActive = !isPickerActive">
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { filename } from 'pathe/utils';
    import { useI18n } from 'vue-i18n';

    const { locale } = useI18n({ useScope: 'global' });

    const isPickerActive = ref(false);

    const languages = [
        {
            id: 0,
            name: "ru",
            caption: "Русский",
            is_current_language: true,
        },
        {
            id: 1,
            name: "en",
            caption: "English",
            is_current_language: false,
        },
    ];

    const currentLanguage = ref(languages.find(lang => lang.is_current_language === true));
    const filteredLanguages = ref(languages.filter(lang => !lang.is_current_language));

    const switchLanguage = (lang) => {
        locale.value = lang;

        languages.forEach((language) => {
            if (language.name === lang) {
                language.is_current_language = true;
            } else {
                language.is_current_language = false;
            }
        });

        currentLanguage.value = languages.find(lang => lang.is_current_language === true);
        filteredLanguages.value = languages.filter(lang => !lang.is_current_language);
        isPickerActive.value = false;

        localStorage.setItem('language', lang);
    }

    onMounted(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) switchLanguage(savedLanguage);
    });

    const glob = import.meta.glob('@/assets/images/icons/*.svg', { eager: true });

    const images = Object.fromEntries(
        Object.entries(glob).map(([key, value]) => [filename(key), value.default])
    )
</script>

<style lang="scss">
    .language-picker {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background-color: $white;
        border-radius: 0.5rem;
        padding: 0.5rem 1.625rem 0.5rem 0.5rem;
        transition: box-shadow 0.2s ease;
        z-index: 2;
        cursor: pointer;
        user-select: none;
        @media screen and (max-width: 480px) {
            @include flex-center;
            top: 1rem;
            right: 1rem;
            height: 2.5rem;
        }
        &__arrow {
            position: absolute;
            top: 1rem;
            right: 0.5rem;
            transition: $transition;
            @media screen and (max-width: 480px) {
                top: 1.05rem;
            }
        }
        &__language {
            @include flex-center-vert;
            &:not(&--current, :last-child) {
                margin-bottom: 1.5rem;
            }
        }
        &__langName {
            display: block;
            font-size: 0.75rem;
            color: $black;
            font-weight: bold;
            line-height: 1;
            margin-left: 0.5rem;
            text-transform: uppercase;
        }
        &__list {
            visibility: hidden;
            opacity: 0;
            margin-top: 1.5rem;
            transition: opacity 0.3s ease;
            position: absolute;
            left: 0;
            top: 0.75rem;
            width: 100%;
            height: auto;
            padding: 0.75rem;
            background-color: $white;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
        }
        &--active {
            box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            .language-picker__list {
                visibility: visible;
                opacity: 1;
                box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            }
            .language-picker__arrow {
                transform: rotate(180deg);
            }
        }
    }
</style>