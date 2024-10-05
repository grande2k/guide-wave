<template>
    <div class="autocomplete-field">
        <input
            type="text"
            class="autocomplete-field__input form-input"
            :class="{ 'expanded': filteredItems.length && isDropdownVisible, 'error': error }"
            v-model="query"
            @input="onInput"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.enter.prevent="onEnter"
            @blur="closeDropDown"
            @focus="onFocus"
            :placeholder="placeholder"
            :disabled="disabled"/>

        <ul v-if="filteredItems.length && isDropdownVisible" class="autocomplete-field__list black-scroll">
            <li v-for="(item, index) in filteredItems" :key="index" @click="selectItem(item)"
                :class="{ 'is-active': index === activeIndex }">
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';

    const props = defineProps({
        items: {
            type: Array,
            required: true,
            default: [],
        },
        placeholder: {
            type: String,
            default: 'Введите значение',
        },
        disabled: {
            type: Boolean,
            default: false
        },
        cities: {
            type: Boolean,
            default: false
        },
        value: {
            type: Number,
            default: null
        },
        error: {
            type: Number,
            default: 0
        }
    });

    const emit = defineEmits(['select']);

    const query = ref('');
    const filteredItems = ref([]);
    const isDropdownVisible = ref(false);
    const activeIndex = ref(-1);

    const onInput = () => {
        emit('select', query.value);

        if (query.value.trim()) {
            filteredItems.value = props.items.filter(item =>
                item.name.toLowerCase().startsWith(query.value.toLowerCase())
            );
        } else {
            filteredItems.value = props.items;
        }

        isDropdownVisible.value = true;
    }

    const onFocus = () => {
        if(query.value === '') {
            filteredItems.value = props.items;
            isDropdownVisible.value = true;
        }
    }

    const onArrowDown = () => {
        if (activeIndex.value < filteredItems.value.length - 1) {
            activeIndex.value++;
        }
    }

    const onArrowUp = () => {
        if (activeIndex.value > 0) {
            activeIndex.value--;
        }
    }

    const onEnter = () => {
        if (activeIndex.value >= 0) {
            selectItem(filteredItems.value[activeIndex.value]);
        }
    }

    const selectItem = (item) => {
        query.value = item.name;
        isDropdownVisible.value = false;
        activeIndex.value = -1;
        emit('select', item);
    }

    watch(() => props.disabled, (newValue, oldValue) => {
        if(!oldValue && newValue) query.value = '';
    });

    watch(() => props.items, (newItems) => {
        if (newItems) {
            props.items.sort((a, b) => a.name.localeCompare(b.name));
            
            if(props.cities) {
                const all_cities_index = props.items.findIndex(item => item.id === 131);
                if (all_cities_index !== -1) {
                    const all_cities = props.items.splice(all_cities_index, 1)[0];
                    props.items.unshift(all_cities);
                }
            }
        }

        if (newItems && props.value !== '') {
            const val = props.items.find(item => item.id === props.value);
            if (val) query.value = val.name;
        }
    }, { immediate: true });

    const closeDropDown = () => {
        setTimeout(() => {
            isDropdownVisible.value = false;
            filteredItems.value = [];
        }, 250);
    }
</script>

<style lang="scss" scoped>
    .autocomplete-field {
        position: relative;
        &__input {
            text-transform: capitalize;
            &.expanded {
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
            &:disabled {
                opacity: 0.5;
            }
        }
        &__list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: $white;
            border-top: none;
            max-height: 150px;
            overflow-y: auto;
            z-index: 10;
            li {
                padding: 0.5rem;
                cursor: pointer;
                &:hover {
                    background-color: rgba($color: $primary, $alpha: 0.125);
                }
            }
        }
    }
</style>
