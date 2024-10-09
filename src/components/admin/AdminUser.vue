<template>
    <div class="guide" v-if="guide">
        <div class="guide__flex">
            <div class="guide__flex-row">
                <div class="guide__photo">
                    <div v-if="guide.photo_url" class="guide__photo-avatar">
                        <img :src="`https://guides-to-go.onrender.com${guide.photo_url}`" alt="User photo" />
                    </div>

                    <div v-else class="guide__photo-empty">
                        <img src="@/assets/images/icons/user.svg" alt="User photo" />
                    </div>
                </div>

                <div class="guide__controls">
                    <button v-if="guide.approved" class="guide__decline" @click="decline">
                        <img src="@/assets/images/icons/lock.svg" alt="lock">
                    </button>

                    <button v-else class="guide__approve" @click="approve">
                        <img src="@/assets/images/icons/unlock.svg" alt="unlock">
                    </button>

                    <button class="guide__delete" @click="deleteUser">
                        <img src="@/assets/images/icons/delete.svg" alt="delete">
                    </button>

                    <button v-if="guide.video_url" class="guide__video" @click="showVideo(guide.video_url)">
                        <img src="@/assets/images/icons/play.svg" alt="play">
                    </button>
                </div>
            </div>

            <div class="guide__info">
                <h3 class="guide__name" v-text="guide.name ?? 'Имя не указано'"/>
                <p class="guide__detail guide__status">Статус: <span :class="{ 'on': guide.is_active, 'off': !guide.is_active }"/></p>
                <p class="guide__detail" v-text="`Страна: ${guide_country}`"/>
                <p class="guide__detail" v-text="`Города: ${cleanCities.map(city => city).join(', ')}`"/>
                <p class="guide__detail" v-text="`Телефон: ${guide.phone ?? ''}`"/>
                <p class="guide__detail" v-text="`E-mail: ${guide.email ?? ''}`"/>
                <p class="guide__detail" v-text="`Дата регистрации: ${formatDate(guide.date_registered)}`"/>
                <p class="guide__detail" v-text="`Дата последних изменений: ${formatDate(guide.last_modified)}`"/>
                <p class="guide__detail" v-text="`Количество звонков: ${guide.count}`"/>
            </div>
        </div>

        <div class="guide__details">
            <div class="guide__languages" v-if="guide.languages && guide.languages.length">
                <p class="guide__detail">Языки:</p>

                <div v-for="(lang, index) in guide.languages" :key="index" class="guide__language" v-text="getLanguageName(lang, index, guide.name)"/>
            </div>

            <p v-else class="guide__details-empty">Нет языков</p>

            <div class="guide__services" v-if="guide.services && guide.services.length">
                <p class="guide__detail">Услуги:</p>

                <div v-for="(service, index) in guide.services" :key="index" class="guide__service" :class="{ filled: service.service_video_url }" @click="showVideo(service.service_video_url)">
                    <img v-if="service.service_video_url" src="@/assets/images/icons/play.svg" alt="play">
                    {{ service.service_name }}
                </div>
            </div>

            <p v-else class="guide__details-empty">Нет услуг</p>
        </div>
    </div>

    <video-modal 
        v-if="is_video_shown"
        :guide_name="guide.name"
        :video_url="video_url"
        @close="is_video_shown = false"
        @ended="is_video_shown = false"/>
</template>

<script setup>
    import { ref, computed } from 'vue';
    import { approveGuide, deleteGuide } from '@/api';
    import { useAppStore } from '@/stores/app';
    import { useI18n } from 'vue-i18n';
    import { useToast } from 'vue-toastification';
    import VideoModal from '@/components/modals/VideoModal.vue';

    const { t } = useI18n();
    const appStore = useAppStore();
    const toast = useToast();
    const is_video_shown = ref(false);
    const video_url = ref(null);

    const emit = defineEmits(['update']);

    const props = defineProps({
        guide: {
            type: Object,
            required: true
        },
        languages: {
            type: Array,
            required: true
        },
    });

    const cleanCities = computed(() => {
        return props.guide.cities.map(city => {
            if (city.startsWith('*')) {
                return city.slice(1);
            }
            return city;
        });
    });

    const guide_country = computed(() => {
        if(appStore.countries && props.guide.country_id !== null) {
            return appStore.countries.find(country => country.id === props.guide.country_id).name;
        } else {
            return '';
        }
    });

    const getLanguageName = (lang, index, name) => {
        if(props.guide.languages.length) {
            const found_lang = props.languages.find(l => l.lang_code === lang);
            if(found_lang) {
                if ((index + 1) < props.guide.languages.length) {
                    return `${found_lang.languages_names.ru},`;
                } else {
                    return found_lang.languages_names.ru;
                }
            } else {
                return 'Неизвестный язык';
            }
        } else {
            return '';
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
            toast.success('Успешно');
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
            toast.success('Успешно');
            emit('update');
        }
    }

    const deleteUser = async () => {
        const params = {
            user_id: props.guide.user_id,
        };

        await deleteGuide(params);
        emit('update');
    }

    const showVideo = (url) => {
        if(url) {
            is_video_shown.value = true;
            video_url.value = url;
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
    }
</script>

<style lang="scss" scoped>
    .guide {
        &__flex {
            display: flex;
            margin-bottom: 1.5rem;
            &-row {
                margin-right: 1.5rem;
                @media screen and (max-width: 480px) {
                    margin-right: 1.25rem;
                }
            }
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
            @media screen and (max-width: 480px) {
                min-width: 4rem;
                width: 4rem;
                height: 4rem;
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
                        width: 2rem;
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
        &__status {
            @include flex-center-vert;
            margin-bottom: 1rem;
            span {
                display: block;
                width: 1.25rem;
                height: 1.25rem;
                border-radius: 50%;
                margin-left: 0.5rem;
                &.on {
                    background-color: #15ff15;
                }
                &.off {
                    background-color: #ff1515;
                }
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
            margin-top: 0.75rem;
            button {
                @include flex-center;
                width: 75%;
                margin: 0 auto;
                height: 3rem;
                border-radius: 0.5rem;
                color: $white;
                padding: 0.5rem;
                cursor: pointer;
                &:not(:last-child) {
                    margin-bottom: 0.5rem;
                }
                @media screen and (max-width: 480px) {
                    width: 80%;
                }
                img {
                    width: 1.5rem;
                    @media screen and (max-width: 480px) {
                        width: 1.25rem;
                    }
                }
            }
        }
        &__service {
            @include flex-center;
            text-decoration: none;
            border-radius: 0.5rem;
            padding: 1rem;
            width: 100%;
            font-weight: 500;
            font-size: 1rem;
            user-select: none;
            text-decoration: none;
            border: 2px solid $white;
            color: $white;
            height: 3.25rem;
            &.filled {
                background-color: $white;
                color: $black;
                cursor: pointer;
                img {
                    filter: invert(1);
                }
            }
            img {
                width: 1.25rem;
                margin-right: 0.5rem;
                @media screen and (max-width: 480px) {
                    width: 1rem;
                    margin-right: 0.25rem;
                }
            }
        }
        &__approve {
            background-color: $success;
        }
        &__decline {
            background-color: #4e3f3f;
        }
        &__delete {
            background-color: $error;
        }
        &__video {
            border: 2px solid $white;
        }
    }
</style>