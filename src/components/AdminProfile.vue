<template>
    <section class="admin-profile page page--bg" :class="{ opened: is_guides_open || is_languages_open || is_services_open }">
        <div class="admin-profile__content scroll-parent white-scroll" v-if="admin_profile">
            <div class="admin-profile__menu white-scroll" v-if="is_guides_open">
                <div class="topbar">
                    <button class="admin-profile__button" @click="is_guides_open = false">
                        <img src="@/assets/images/icons/arrow-left.svg" alt="back">
                    </button>

                    <h2 class="admin-profile__title">Исполнители</h2>
                </div>

                <div v-if="admin_profile.guides.length">
                    <admin-guide-request
                        v-for="guide in admin_profile.guides"
                        :key="guide.user_id"
                        :guide="guide"
                        :countries="admin_profile.countries"
                        :languages="admin_profile.languages"
                        :services="admin_profile.services"
                        @update="handleGuidesUpdate"/>
                </div>

                <p v-else class="admin-profile__message">Пусто</p>
            </div>

            <div class="admin-profile__menu white-scroll" v-if="is_languages_open">
                <div class="topbar">
                    <button class="admin-profile__button" @click="is_languages_open = false">
                        <img src="@/assets/images/icons/arrow-left.svg" alt="back">
                    </button>

                    <h2 class="admin-profile__title">Языки</h2>
                </div>

                <div v-if="admin_profile.languages.length">
                    <p class="admin-profile__message">Список языков:</p>

                    <div 
                        v-for="lang in admin_profile.languages"
                        :key="lang.lang_code"
                        class="admin-profile__language" 
                        v-text="lang.languages_names.ru"/>
                </div>

                <p v-else class="admin-profile__message">Пусто</p>

                <button class="add-button" @click="openLanguageCreateModal">
                    <img src="@/assets/images/icons/close.svg" alt="plus">
                    Добавить
                </button>
            </div>

            <div class="admin-profile__menu white-scroll" v-if="is_services_open">
                <div class="topbar">
                    <button class="admin-profile__button" @click="is_services_open = false">
                        <img src="@/assets/images/icons/arrow-left.svg" alt="back">
                    </button>

                    <h2 class="admin-profile__title">Услуги</h2>
                </div>

                <div v-if="admin_profile.services.length">
                    <p class="admin-profile__message">Список языков:</p>

                    <div 
                        v-for="service in admin_profile.services"
                        :key="service.services_name.ru"
                        class="admin-profile__language" 
                        v-text="service.services_name.ru"/>
                </div>

                <p v-else class="admin-profile__message">Пусто</p>

                <button class="add-button" @click="openServicesCreateModal">
                    <img src="@/assets/images/icons/close.svg" alt="plus">
                    Добавить
                </button>
            </div>

            <button class="admin-profile__button" @click="is_services_open = true">Услуги</button>
            <button class="admin-profile__button" @click="is_guides_open = true">Исполнители</button>
            <button class="admin-profile__button" @click="is_languages_open = true">Языки</button>
            <button class="admin-profile__button">Надписи</button>

            <button type="button" class="logout full-column" @click="logout">
                <img src="@/assets/images/icons/login.svg" alt="log out">
                {{ $t('log_out') }}
            </button>
        </div>
    </section>

    <admin-create-modal
        v-if="is_create_modal_open"
        :type="modal_props.type"
        :title="modal_props.title"
        @submitted="handleCreateModalSubmit"
        @close="is_create_modal_open = false"/>
</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useI18n } from 'vue-i18n';
    import { getGuides, getAdminLanguages, getAdminServices, getCountries, addLanguages, addServices } from '@/api';
    import { useToast } from 'vue-toastification';
    import AdminGuideRequest from './AdminGuideRequest.vue';
    import AdminCreateModal from './modals/AdminCreateModal.vue';

    const router = useRouter();
    const toast = useToast();
    const { t } = useI18n();

    const admin_profile = ref({
        guides: [],
        languages: [],
        services: [],
        countries: [],
    });

    const modal_props = reactive({
        title: '',
        type: ''
    })
    
    const is_create_modal_open = ref(false);
    const is_guides_open = ref(false);
    const is_languages_open = ref(false);
    const is_services_open = ref(false);

    onMounted(async () => {
        admin_profile.value.guides = await getGuides(router, t);
        admin_profile.value.languages = await getAdminLanguages(t);
        admin_profile.value.services = await getAdminServices(t);
        admin_profile.value.countries = await getCountries(t);
    });

    const handleGuidesUpdate = async () => {
        admin_profile.value.guides = await getGuides(router, t);
    }

    const handleCreateModalSubmit = async (result) => {
        switch (result.type.toLowerCase()) {
            case 'languages':
                const lang_params = {
                    lang_code: result.data.lang_code,
                    languages_names: {
                        ru: result.data.ru,
                        en: result.data.en
                    }
                };

                const lang_response_result = await addLanguages(lang_params, t);

                if (lang_response_result) {
                    toast.success('Язык успешно добавлен');
                    admin_profile.value.languages = await getAdminLanguages(t);
                }

                break;
            case 'services':
                const services_params = {
                    services_name: {
                        ru: result.data.ru,
                        en: result.data.en
                    }
                };

                const services_response_result = await addServices(services_params, t);

                if (services_response_result) {
                    toast.success('Услуга успешно добавлена');
                    admin_profile.value.services = await getAdminServices(t);
                }

                break;
            default:
                toast.error('Произошла ошибка');
                break;
        }

        modal_props.title = "",
        modal_props.type = ""
    }

    const openLanguageCreateModal = () => {
        is_create_modal_open.value = true;
        modal_props.title = "Добавление нового языка",
        modal_props.type = "languages"
    }

    const openServicesCreateModal = () => {
        is_create_modal_open.value = true;
        modal_props.title = "Добавление новой услуги",
        modal_props.type = "services"
    }

    const logout = () => {
        $cookies.remove("access_token");
        $cookies.remove("user_role");
        router.push('/login');
    }
</script>

<style lang="scss" scoped>
    .admin-profile {
        position: relative;
        &.opened {
            max-height: 700px;
            height: 100%;
            @media screen and (max-width: 480px) {
                max-height: 85%;
            }
        }
        &__button {
            @include flex-center;
            color: $white;
            border: 1px solid $white;
            font-weight: bold;
            cursor: pointer;
            border-radius: 0.5rem;
            padding: 1rem;
            width: 100%;
            font-size: 1.25rem;
            &:not(:last-child) {
                margin-bottom: 1rem;
            }
            img {
                width: 1.5rem;
            }
        }
        &__menu {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: $primary;
            overflow-y: auto;
            z-index: 3;
            padding: 1.5rem;
            .topbar {
                @include flex-center-vert;
                position: relative;
                margin-bottom: 1rem;
                button {
                    width: 3rem;
                    height: 3rem;
                    margin-bottom: 0;
                }
                h2 {
                    color: $white;
                    margin: 0;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
        &__message {
            color: $white;
            margin: 0 0 1rem 0;
            font-weight: 500;
            font-size: 1.5rem;
            text-align: center;
        }
        &__language {
            background-color: $white;
            padding: 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            &:not(:last-child) {
                margin-bottom: 0.75rem;
            }
        }
        .add-button {
            @include flex-center;
            width: 100%;
            border-radius: 0.5rem;
            background-color: $secondary;
            color: $white;
            cursor: pointer;
            margin-top: 1.5rem;
            padding: 1rem;
            img {
                transform: rotate(45deg);
                filter: invert(1);
                width: 1.5rem;
                margin-right: 0.5rem;
            }
        }
    }
</style>