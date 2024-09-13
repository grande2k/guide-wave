<template>
    <div class="guide" v-if="guide">
        <div class="guide__flex">
            <div class="guide__photo">
                <div v-if="guide.photo_url" class="guide__photo-avatar">
                    <img :src="`https://guides-to-go.onrender.com${guide.photo_url}`" alt="User photo" />
                </div>

                <div v-else class="guide__photo-empty">
                    <img src="@/assets/images/icons/user.svg" alt="User photo" />
                </div>
            </div>

            <div class="guide__info">
                <h3 class="guide__name" v-text="guide.name"/>
                <p class="guide__detail" v-text="`Страна: ${guide_country}`"/>
                <p class="guide__detail" v-text="`Город: ${guide_city}`"/>
                <p class="guide__detail" v-text="`Телефон: ${guide.phone}`"/>
            </div>
        </div>

        <div class="guide__details">
            <div class="guide__languages" v-if="guide.languages.length">
                <p class="guide__detail">Языки:</p>

                <div v-for="(lang, index) in guide.languages" :key="index" class="guide__language" v-text="getLanguageName(lang, index)"/>
            </div>

            <p v-else class="guide__details-empty">Нет языков</p>

            <div class="guide__services" v-if="guide.services.length">
                <p class="guide__detail">Услуги:</p>

                <div v-for="(service, index) in guide.services" :key="index" class="guide__language" v-text="getServiceName(service, index)"/>
            </div>

            <p v-else class="guide__details-empty">Нет услуг</p>
        </div>

        <div class="guide__controls">
            <button class="guide__decline" @click="decline">
                <img src="@/assets/images/icons/close.svg" alt="decline">
                Отклонить
            </button>

            <button class="guide__approve" @click="approve">
                <img src="@/assets/images/icons/check.svg" alt="approve">
                Одобрить
            </button>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { getCities, approveGuide } from '@/api';
    import { useI18n } from 'vue-i18n';
    import { useToast } from 'vue-toastification';

    const { t } = useI18n();
    const toast = useToast();
    const cities = ref([]);

    const emit = defineEmits(['update']);

    onMounted(async () => {
       cities.value = await getCities(props.guide.country_id, t, 'ru'); 
    });

    const props = defineProps({
        guide: {
            type: Object,
            required: true
        },
        countries: {
            type: Array,
            required: true
        },
        languages: {
            type: Array,
            required: true
        },
        services: {
            type: Array,
            required: true
        }
    });

    const guide_country = computed(() => {
        return props.countries.find(country => country.id === props.guide.country_id).name;
    });

    const guide_city = computed(() => {
        if(cities.value.length) {
            return cities.value.find(city => city.id === props.guide.city_id).name;
        } else {
            return '';
        }
    });

    const getLanguageName = (lang, index) => {
        if(props.languages) {
            const found_lang = props.languages.find(l => l.lang_code === lang).languages_names.ru;
            if((index + 1) < props.guide.languages.length) {
                if (found_lang) return `${found_lang},`;
            } else {
                if (found_lang) return found_lang;
            }
        } else {
            return '';
        }
    }

    const getServiceName = (service, index) => {
        if ((index + 1) < props.guide.services.length) {
            return `${service.service_name.ru},`;
        } else {
            return service.service_name.ru;
        }
    }

    const approve = async () => {
        const params = { 
            data: [
                {
                    user_id: props.guide.user_id,
                    status: true
                }
            ] 
        };

        const approve_response = await approveGuide(params, t);

        if(approve_response.status === "success") {
            toast.success('Гид был успешно одобрен');
            emit('update');
        } 
    }

    const decline = async () => {
        const params = {
            data: [
                {
                    user_id: props.guide.user_id,
                    status: false
                }
            ]
        };

        const approve_response = await approveGuide(params, t);

        if (approve_response.status === "success") {
            toast.success('Гид был успешно отклонен');
            emit('update');
        }
    }
</script>

<style lang="scss" scoped>
    .guide {
        &__flex {
            display: flex;
            margin-bottom: 1.5rem;
        }
        &:not(:last-child) {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba($color: $white, $alpha: 0.75);
            @media screen and (max-width: 480px) {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
            }
        }
        &__photo {
            position: relative;
            width: 6rem;
            min-width: 6rem;
            height: 6rem;
            border-radius: 50%;
            border: 2px solid $white;
            margin-right: 1.5rem;
            @media screen and (max-width: 480px) {
                min-width: 4rem;
                width: 4rem;
                height: 4rem;
                margin-right: 1.25rem;
            }
            &-avatar {
                width: 100%;
                height: 100%;
                border-radius: inherit;
                img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                    object-fit: cover;
                    object-position: center;
                }
            }
            &-empty {
                @include flex-center;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: $white;
                img {
                    display: block;
                    width: 4rem;
                    @media screen and (max-width: 480px) {
                        width: 3rem;
                    }
                }
            }
        }
        &__info {
            flex: auto;
        }
        &__name {
            font-size: 1.5rem;
            color: $white;
            font-weight: bold;
            margin: 0 0 0.75rem 0;
            line-height: 1;
            @media screen and (max-width: 480px) {
                font-size: 1.325rem;
                margin-bottom: 0.75rem;
            }
        }
        &__details-empty {
            color: $white;
            margin: 0;
            font-weight: bold;
        }
        &__detail {
            color: $white;
            margin: 0;
            &:not(:last-child) {
                margin-bottom: 0.75rem;
            }
        }
        &__languages,
        &__services {
            display: flex;
            flex-wrap: wrap;
            row-gap: 0.5rem;
            margin-bottom: 1rem;
            & > *:first-child {
                margin: 0;
                margin-right: 0.5rem;
            }
        }
        &__language {
            color: $white;
            &:not(:last-child) {
                margin-right: 0.5rem;
            }
        }
        &__controls {
            @include grid(2, 0.5rem);
            margin-top: 1rem;
            button {
                @include flex-center;
                width: 100%;
                border-radius: 0.25rem;
                color: $white;
                padding: 1rem;
                cursor: pointer;
                img {
                    width: 1.25rem;
                    margin-right: 0.25rem;
                }
                &:first-child {
                    background-color: $error;
                    img {
                        filter: invert(1);
                    }
                }
                &:last-child {
                    background-color: $success;
                }
            }
        }
    }
</style>