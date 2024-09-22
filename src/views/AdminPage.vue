<template>
    <section class="admin page page--bg">
        <div class="admin__view" :class="{ active: hasRouteInside }">
            <div class="white-scroll">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
        </div>

        <div class="admin__content scroll-parent white-scroll">
            <admin-split/>
            <admin-video-duration/>

            <ul class="admin__links">
                <li class="admin__link">
                    <router-link to="/admin/guides">Исполнители</router-link>
                </li>
                <li class="admin__link">
                    <router-link to="/admin/services">Услуги</router-link>
                </li>
                <li class="admin__link">
                    <router-link to="/admin/languages">Языки (критерий)</router-link>
                </li>
                <li class="admin__link">
                    <router-link to="/admin/interfaces">Языки (интерфейс)</router-link>
                </li>
            </ul>

            <admin-email/>

            <button type="button" class="logout" @click="logout">
                <img src="@/assets/images/icons/login.svg" alt="log out">
                Выйти
            </button>
        </div>
    </section>
</template>

<script setup>
    import { computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import AdminSplit from '@/components/admin/AdminSplit.vue';
    import AdminVideoDuration from '@/components/admin/AdminVideoDuration.vue';
    import AdminEmail from '@/components/admin/AdminEmail.vue';

    const route = useRoute();
    const router = useRouter();

    const hasRouteInside = computed(() => {
        return (
            route.name === "admin-guides" || route.name === "admin-services" || route.name === "admin-languages" || route.name === "admin-interfaces"
        );
    });

    const logout = () => {
        $cookies.remove("access_token");
        $cookies.remove("user_role");
        router.push('/login');
    }
</script>

<style lang="scss" scoped>
    .admin {
        height: 75%;
        position: relative;
        &__content {
            position: relative;
            z-index: 2;
        }
        &__view {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 1;
            background-color: $primary;
            padding: 1.5rem 1rem 1.5rem 1.5rem;
            @media screen and (max-width: 480px) {
                padding: 1.5rem 0.5rem 1.5rem 0.75rem;
            }
            & > * {
                overflow: auto;
                height: 100%;
                padding-right: 0.5rem;
            }
            &.active {
                z-index: 3;
            }
        }
        &__child {
            background-color: $primary;
        }
        &__link {
            &:not(:last-child) {
                margin-bottom: 1rem;
            }
            & > * {
                @include flex-center;
                color: $white;
                border: 1px solid $white;
                font-weight: bold;
                cursor: pointer;
                border-radius: 0.5rem;
                padding: 1rem;
                width: 100%;
                font-size: 1.25rem;
                text-decoration: none;
            }
        }
    }
</style>