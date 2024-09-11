<template>
    <teleport to="body">
        <div class="calendar modal">
            <div class="modal__content calendar__content" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <p v-text="$t('occupancy_calendar')"/>

                <div class="calendar__days-column">
                    <div v-for="(day, index) in days" :key="index" class="calendar__day">
                        <span v-text="formatDate(day)" class="calendar__day-text" />
                        <div class="calendar__time-row">
                            <span v-for="time in timeSlots" :key="time" class="calendar__time"
                                :class="{ 'calendar__time--busy': isBusy(day, time) }" v-text="time" @click="pickTime(day, time)"/>
                        </div>
                    </div>
                </div>

                <submit-button
                    blue
                    text="save"
                    icon="check"
                    :loading="response_loading"
                    class="full-column"
                    @click="submitCalendar"/>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { addCalendar } from '@/api';
    import { useI18n } from 'vue-i18n';
    import { useToast } from 'vue-toastification';
    import SubmitButton from '../SubmitButton.vue';

    const { t } = useI18n();
    const toast = useToast();
    const target = ref(null);
    const emit = defineEmits(['close', 'updated']);
    const calendar = ref([]);
    const response_loading = ref(false);

    onClickOutside(target, () => emit('close'));

    const props = defineProps({
        dates: {
            type: Array,
            default: []
        }
    });

    watch(() => props.dates, (newDates) => {
        newDates ? calendar.value = newDates : calendar.value = [];
    }, { immediate: true, deep: true });

    const generateNextDays = (count) => {
        const today = new Date();
        const daysArray = [];
        for (let i = 0; i < count; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            daysArray.push(nextDay);
        }
        return daysArray;
    }

    const generateTimeSlots = (startHour, endHour) => {
        const timeArray = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            timeArray.push(hour);
        }
        return timeArray;
    }

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    const toDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    }

    const isBusy = (day, time) => {
        const busyDay = props.dates.find(d => toDate(d.data_time).toDateString() === day.toDateString());

        return busyDay ? busyDay.hours.includes(time) : false;
    }

    const formatDateWithTimezone = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }


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
    }

    const submitCalendar = async () => {
        if(calendar.value.length) {
            response_loading.value = true;
            const params = { data: calendar.value };
            console.log(params.data);
            await addCalendar(params, t);

            response_loading.value = false;
            emit('updated');
        }

        toast.success(t('messages.save_success'));
    }

    const days = ref(generateNextDays(5));
    const timeSlots = ref(generateTimeSlots(9, 21));
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
                margin: 0 0 2rem 0;
                @media screen and (max-width: 480px) {
                    font-size: 1rem;
                    margin-bottom: 1.25rem;
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
