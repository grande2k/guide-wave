<template>
    <guide-profile v-if="$cookies.get('user_role') === '1'"/>
    <admin-profile v-if="$cookies.get('user_role') === '2'"/>
</template>

<script setup>
    import { onMounted, inject } from 'vue';
    import { useRouter } from 'vue-router';
    import GuideProfile from '@/components/GuideProfile.vue';
    import AdminProfile from '@/components/AdminProfile.vue';

    const $cookies = inject('$cookies');
    const router = useRouter();

    onMounted(() => {
        if ( !$cookies.get("access_token") ) {
            router.push('/login');
        }
    });
</script>