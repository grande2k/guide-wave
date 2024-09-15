<template>
    <teleport to="body">
        <div class="calendar modal">
            <div class="modal__content calendar__content" ref="target">
                <div class="modal__close" @click="submitCalendar(); emit('close', isCalendarChanged())">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <p v-text="$t('calendar_modal_title')"/>

                <div class="calendar__nav">
                    <button @click="goBack" :disabled="isBackDisabled">
                        <img src="@/assets/images/icons/arrow-left.svg" alt="prev">
                    </button>

                    <button @click="goForward">
                        <img src="@/assets/images/icons/arrow-left.svg" alt="next">
                    </button>
                </div>

                <div class="calendar__days-column">
                    <div v-for="(day, index) in days" :key="index" class="calendar__day">
                        <span v-text="formatDate(day)" class="calendar__day-text" />
                        <div class="calendar__time-row">
                            <span v-for="time in timeSlots" :key="time" class="calendar__time"
                                :class="{ 'calendar__time--busy': isBusy(day, time) }" v-text="time" @click="pickTime(day, time)"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, watch, computed } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { addCalendar } from '@/api';
    import { useI18n } from 'vue-i18n';
    import { useToast } from 'vue-toastification';

    const { t } = useI18n();
    const toast = useToast();
    const target = ref(null);
    const emit = defineEmits(['close', 'updated']);
    const calendar = ref([]);
    const response_loading = ref(false);

    const props = defineProps({
        dates: {
            type: Array,
            default: []
        }
    });

    const initialCalendar = ref([]);

    onClickOutside(target, () => {
        submitCalendar();
        emit('close', isCalendarChanged());
    });

    watch(() => props.dates, (newDates) => {
        if (newDates) {
            // Создаем независимую копию props.dates с помощью метода JSON
            calendar.value = JSON.parse(JSON.stringify(newDates));
            initialCalendar.value = JSON.parse(JSON.stringify(newDates));
        } else {
            calendar.value = [];
        }
    }, { immediate: true, deep: true });

    const deepEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;

        return arr1.every((item1, index) => {
            const item2 = arr2[index];
            return (
                item1.data_time === item2.data_time &&
                JSON.stringify(item1.hours.sort()) === JSON.stringify(item2.hours.sort())
            );
        });
    };

    const isCalendarChanged = () => {
        return !deepEqual(calendar.value, initialCalendar.value);
    };

    const startDate = ref(new Date());

    const generateNextDays = (start, count) => {
        const daysArray = [];
        for (let i = 0; i < count; i++) {
            const nextDay = new Date(start);
            nextDay.setDate(start.getDate() + i);
            daysArray.push(nextDay);
        }
        return daysArray;
    };

    const generateTimeSlots = (startHour, endHour) => {
        const timeArray = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            timeArray.push(hour);
        }
        return timeArray;
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const toDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };

    const isBusy = (day, time) => {
        const busyDay = calendar.value.find(d => toDate(d.data_time).toDateString() === day.toDateString());
        return busyDay ? busyDay.hours.includes(time) : false;
    };

    const formatDateWithTimezone = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const pickTime = (day, time) => {
        const dayStr = formatDateWithTimezone(day);
        const existingEntry = calendar.value.find(d => d.data_time === dayStr);

        if (existingEntry) {
            if (!existingEntry.hours.includes(time)) {
                existingEntry.hours.push(time);
            } else {
                existingEntry.hours = existingEntry.hours.filter(h => h !== time);
            }
        } else {
            calendar.value.push({
                data_time: dayStr,
                hours: [time]
            });
        }
    };

    const submitCalendar = async () => {
        if (isCalendarChanged()) {
            if (calendar.value.length) {
                response_loading.value = true;
                const params = { data: calendar.value };
                console.log(params.data);
                await addCalendar(params, t);

                response_loading.value = false;
                emit('updated');
            }

            toast.success(t('messages.save_success'));
        }
    };

    const days = ref(generateNextDays(startDate.value, 5));
    const timeSlots = ref(generateTimeSlots(9, 21));

    const goBack = () => {
        const newStartDate = new Date(startDate.value);
        newStartDate.setDate(newStartDate.getDate() - 5);

        if (newStartDate >= new Date().setHours(0, 0, 0, 0)) {
            startDate.value = newStartDate;
            days.value = generateNextDays(startDate.value, 5);
        }
    };

    const goForward = () => {
        const newStartDate = new Date(startDate.value);
        newStartDate.setDate(newStartDate.getDate() + 5);
        startDate.value = newStartDate;
        days.value = generateNextDays(startDate.value, 5);
    };

    const isBackDisabled = computed(() => {
        return startDate.value <= new Date().setHours(0, 0, 0, 0);
    });
</script>


<style lang="scss" scoped>
    .calendar {
        &__content {
            padding: 1.5rem 1rem;
            & > p {
                color: $black;
                font-weight: bold;
                text-align: center;
                font-size: 1.5rem;
                margin: 0 0 1.5rem 0;
                @media screen and (max-width: 480px) {
                    font-size: 1rem;
                    margin-bottom: 1.25rem;
                }
            }
        }
        &__nav {
            @include flex-center;
            margin-bottom: 1.5rem;
            button {
                @include flex-center;
                width: 3rem;
                height: 3rem;
                background-color: $primary;
                border-radius: 50%;
                cursor: pointer;
                img {
                    width: 1.5rem;
                    @media screen and (max-width: 480px) {
                        width: 1rem;
                    }
                }
                &:last-child {
                    margin-left: 1rem;
                    img {
                        transform: rotate(180deg);
                    }
                }
                @media screen and (max-width: 480px) {
                    width: 2.5rem;
                    height: 2.5rem;
                }
            }
        }
        &__days-column {
            margin-bottom: 2rem;
            overflow: auto;
            @media screen and (max-width: 480px) {
                margin-bottom: 1rem;
            }
        }
        &__day {
            @include flex-center-vert;
            &:not(:last-child) {
                margin-bottom: 1.75rem;
                @media screen and (max-width: 480px) {
                    margin-bottom: 1rem;
                }
            }
        }
        &__day-text {
            font-weight: bold;
            margin-right: 1rem;
            @media screen and (max-width: 480px) {
                font-size: 0.875rem;
            }
        }
        &__time-row {
            display: flex;
            gap: 0.5rem;
        }
        &__time {
            @include flex-center;
            font-size: 1rem;
            width: 2.25rem;
            height: 2.25rem;
            min-width: 2rem;
            border-radius: 50%;
            background-color: transparent;
            color: $primary;
            font-weight: 500;
            line-height: 1;
            border: 1px solid $primary;
            transition: $transition;
            cursor: pointer;
            @media screen and (max-width: 480px) {
                font-size: 0.875rem;
                width: 2rem;
                min-width: 2rem;
                height: 2rem;
            }
            &--busy {
                background-color: $primary;
                color: $white;
            }
        }
    }
</style>
