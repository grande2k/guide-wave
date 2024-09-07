<template>
    <guide-profile/>
</template>

<script setup>
    import { onMounted, inject } from 'vue';
    import { useRouter } from 'vue-router';
    import GuideProfile from '@/components/GuideProfile.vue';

    const $cookies = inject('$cookies');
    const router = useRouter();

    onMounted(() => {
        if ( !$cookies.get("access_token") ) {
            router.push('/login');
        }
    });
</script>