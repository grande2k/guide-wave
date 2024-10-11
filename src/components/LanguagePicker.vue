<template>
    <div v-if="languages" class="language-picker" :class="{ 'language-picker--active': isPickerActive }">
        <div class="language-picker__language language-picker__language--current" @click="isPickerActive = !isPickerActive">
            <div class="language-picker__flag">
                <img :src="`https://guides-to-go.onrender.com/flags/${currentLanguage.lang_code}.svg`" alt="flag">
            </div>
            <span class="language-picker__langName" v-text="currentLanguage.lang_code" />
        </div>

        <ul class="language-picker__list black-scroll">
            <li v-for="lang in filteredLanguages" :key="lang.id" class="language-picker__language"
                @click="switchLanguage(lang.lang_code)">
                <div class="language-picker__flag">
                    <img :src="`https://guides-to-go.onrender.com/flags/${lang.lang_code}.svg`" alt="flag">
                </div>

                <span class="language-picker__langName" v-text="lang.lang_code" />
            </li>
        </ul>

        <img src="@/assets/images/icons/arrow-down.svg" class="language-picker__arrow" alt="arrow" @click="isPickerActive = !isPickerActive">
    </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';
    import { useI18n } from 'vue-i18n';
    import { useAppStore } from '@/stores/app';
    import { getInterface, getCountries } from '@/api'

    const appStore = useAppStore();
    const { t } = useI18n();
    const { locale, getLocaleMessage, setLocaleMessage } = useI18n({ useScope: 'global' });
    const isPickerActive = ref(false);
    const languages = ref(null);

    const currentLanguage = ref(null);
    const filteredLanguages = ref(null);

    const switchLanguage = async (lang) => {
        if (locale.value !== lang && !Object.keys(getLocaleMessage(lang)).length) {
            const translations = await getInterface(lang);

            if (translations) {
                setLocaleMessage(lang, translations);
            } else {
                console.error(`Translations for ${lang} could not be loaded.`);
            }
        }

        locale.value = lang;

        languages.value.forEach((language) => {
            if (language.lang_code === lang) {
                language.is_current_language = true;
            } else {
                language.is_current_language = false;
            }
        });

        currentLanguage.value = languages.value.find(lang => lang.is_current_language === true);
        filteredLanguages.value = languages.value.filter(lang => !lang.is_current_language).sort((a, b) => a.lang_code.localeCompare(b.lang_code));
        isPickerActive.value = false;

        localStorage.setItem('language', lang);
        appStore.setCountries(await getCountries(t));
    }

    watch(() => appStore.interface_languages, (newLangs) => {
        if(newLangs) {
            languages.value = newLangs;
            if(!localStorage.getItem('language') && !currentLanguage.value) {
                const userLang = navigator.userLanguage || navigator.language || "en";
                const formattedUserLang = userLang.length > 2 ? userLang.slice(0, 2) : userLang;
                currentLanguage.value = languages.value.find(lang => lang.lang_code === formattedUserLang.toLowerCase());
                localStorage.setItem('language', currentLanguage.value.lang_code);
            } else {
                currentLanguage.value = languages.value.find(lang => lang.is_current_language === true);
            }
            filteredLanguages.value = languages.value.filter(lang => !lang.is_current_language).sort((a, b) => a.lang_code.localeCompare(b.lang_code));

            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage && languages.value) switchLanguage(savedLanguage);
        }
    }, { immediate: true });

    onMounted(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && languages.value) switchLanguage(savedLanguage);
    });
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
            top: 1.25rem;
            right: 0.5rem;
            transition: $transition;
            @media screen and (max-width: 480px) {
                top: 1.05rem;
            }
        }
        &__language {
            @include flex-center-vert;
            &:not(&--current, :last-child) {
                margin-bottom: 0.5rem;
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
            max-height: 400px;
            padding: 0.5rem 0;
            background-color: $white;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            overflow: auto;
            & > li {
                padding: 0 0.5rem;
                transition: all 0.15s ease;
                &:hover {
                    background-color: rgba($color: $black, $alpha: 0.125);
                }
            }
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