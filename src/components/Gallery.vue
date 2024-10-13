<template>
    <teleport to="body">
        <Carousel class="gallery" :items-to-show="1" :wrap-around="slides.length > 1 ? true : false" :autoplay="10000" v-model="currentSlide">
            <Slide v-for="(slide, index) in slides" :key="index">
                <img :src="`https://guides-to-go.onrender.com${slide.photo_url}`" alt="slide.name" class="gallery__item">
            </Slide>
        </Carousel>
    </teleport>

    <teleport to="body">
        <div v-if="slides.length > 1" class="gallery__navigation" :class="{ 'start': isScrollable }">
            <div class="gallery__navigation-item" v-for="(slide, index) in slides" :key="index" :class="{ active: currentSlide === index }" :ref="el => circleRefs[index] = el" @click="slideTo(index)">
                <div class="gallery__navigation-item-image">
                    <img :src="`https://guides-to-go.onrender.com${slide.photo_url}`" :alt="slide.name" class="gallery__item">
                    <div class="progress-bar"></div>
                </div>
                
                <p v-if="slide.name" v-text="slide.name" class="gallery__navigation-item-name"/>
            </div>
        </div>
    </teleport>

    <teleport to=".layout">
        <button class="go-search" @click="emit('close')">
            <img src="@/assets/images/icons/search.svg" alt="search">
            {{ $t('search') }}
        </button>
    </teleport>
</template>

<script setup>
    import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from 'vue';
    import { Carousel, Slide } from 'vue3-carousel';
    import 'vue3-carousel/dist/carousel.css';

    const props = defineProps({
        backgrounds: {
            type: Object,
            required: true,
            default: {}
        },
        cities: {
            type: Array,
            required: true,
            default: []
        },
        country_name: {
            type: String,
            required: true,
            default: ''
        },
        first_city_id: {
            type: Number,
            required: false
        }
    });

    const emit = defineEmits(['close']);
    const isScrollable = ref(false);

    onMounted(() => {
        document.body.classList.add("gallery-on");

        if (slides.value.length > 1) {
            if (document.querySelector(".gallery__navigation").scrollWidth > document.querySelector(".gallery__navigation").clientWidth) {
                isScrollable.value = true;
            }
        }
    });

    onBeforeUnmount(() => {
        document.body.classList.remove("gallery-on");
        document.body.style.backgroundImage = sessionStorage.getItem("background_image");
    });

    const slides = computed(() => {
        if (props.backgrounds) {
            let slides_list = [];

            if (props.backgrounds.cities_photos.length) {
                slides_list = props.backgrounds.cities_photos.map(city => {
                    const cityData = props.cities.find(c => c.id === city.city_id);
                    return {
                        photo_url: city.photo_url,
                        name: cityData ? cityData.name : ''
                    };
                });
            }

            if (props.backgrounds.country_photo) {
                slides_list.unshift({
                    photo_url: props.backgrounds.country_photo,
                    name: props.country_name
                });
            }

            if (props.first_city_id) {
                const first_city = props.backgrounds.cities_photos.find(city => city.city_id === props.first_city_id);
                if (first_city) {
                    const cityData = props.cities.find(c => c.id === first_city.city_id);
                    slides_list.unshift({
                        photo_url: first_city.photo_url,
                        name: cityData ? cityData.name : ''
                    });
                }
            }

            console.log(slides_list);

            return slides_list;
        } else {
            return [];
        }
    });


    const currentSlide = ref(0);
    const circleRefs = ref([]);

    watch(currentSlide, async (newIndex) => {
        resetProgress();

        await nextTick();

        if(isScrollable.value) {
            const targetRef = circleRefs.value[newIndex];

            if (targetRef) {
                targetRef.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'center'
                });
            }
        }
    });

    const resetProgress = () => {
        if(slides.value.length > 1) {
            document.querySelectorAll(".gallery__navigation .gallery__navigation-item .progress-bar").forEach(bar => {
                bar.style.animation = 'none';
                setTimeout(() => {
                    bar.style.animation = '';
                }, 10);
            });
        }
    }

    const slideTo = (val) => {
        currentSlide.value = val;
    }
</script>

<style lang="scss">
    body.gallery-on {
        background-image: none;
        .layout {
            #site-header {
                position: absolute;
                top: 2rem;
                left: 12rem;
                margin-bottom: 0;
                @media screen and (max-width: 480px) {
                    left: 5rem;
                    top: 1.25rem;
                }
            }
            .go-home,
            .page.search {
                display: none;
            }
            .go-search {
                @include flex-center;
                position: absolute;
                top: 2rem;
                left: 2rem;
                padding: 0.75rem 1rem;
                background-color: $primary;
                color: $black;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
                color: $white;
                img {
                    width: 1.5rem;
                    margin-right: 0.5rem;
                }
                @media screen and (max-width: 480px) {
                    top: 1rem;
                    left: 1rem;
                    font-size: 0;
                    padding: 0.75rem;
                    img {
                        margin-right: 0;
                    }
                }
            }
        }
    }
    .go-search {
        display: none;
    }
    .carousel__track {
        margin: 0;
    }
    .gallery {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba($color: $black, $alpha: 0.325);
            z-index: 2;
        }
        * {
            width: 100%;
            height: 100%;
        }
        .carousel {
            &__slide {
                position: relative;
                z-index: 1;
                img {
                    object-fit: cover;
                }
            }
        }
    }

    .gallery__navigation {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        width: 100%;
        display: flex;
        justify-content: center;
        overflow-x: auto;
        padding: 0 1rem;
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;
        &.start {
            justify-content: flex-start;
        }
        &::-webkit-scrollbar {
            display: none;
        }
        @media screen and (max-width: 480px) {
            bottom: 1rem;
        }
        &-item {
            min-width: 200px;
            max-width: 200px;
            width: 100%;
            cursor: pointer;
            &-image {
                position: relative;
            }
            &-name {
                color: $white;
                margin: 0.5rem 0 0 0;
                font-weight: normal;
                text-align: center;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                user-select: none;
                @media screen and (max-width: 480px) {
                    font-size: 0.875rem;
                }
            }
            @media screen and (max-width: 480px) {
                min-width: 120px;
                max-width: 120px;
            }
            img {
                border-radius: 0.75rem;
                @media screen and (max-width: 480px) {
                    border-radius: 0.25rem;
                }
            }
            &:not(:last-child) {
                margin-right: 0.5rem;
            }
            .progress-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 6px;
                background-color: rgba(255, 255, 255, 0.675);
                width: 0;
                opacity: 0;
                border-radius: 0.75rem;
                @media screen and (max-width: 480px) {
                    border-radius: 0.25rem;
                    height: 4px;
                }
            }
            &.active .progress-bar {
                width: 100%;
                animation: progress 10s linear;
                animation-iteration-count: 1;
                transform-origin: left;
                opacity: 1;
            }
        }
    }

    @keyframes progress {
        0% {
            width: 100%;
        }
        100% {
            width: 0;
        }
    }
</style>