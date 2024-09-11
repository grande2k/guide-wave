<template>
    <div class="calendar">
        <p v-text="$t('free_time')" />

        <div class="calendar__days-column">
            <div v-for="(day, index) in days" :key="index" class="calendar__day">
                <span v-text="formatDate(day)" class="calendar__day-text" />

                <div class="calendar__time-row">
                    <span v-for="time in timeSlots" :key="time" class="calendar__time"
                        :class="{ 'calendar__time--busy': isBusy(day, time) }" v-text="time"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        dates: {
            type: Array,
            default: []
        }
    });

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

    const days = ref(generateNextDays(5));
    const timeSlots = ref(generateTimeSlots(9, 21));
</script>

<style lang="scss" scoped>
    .calendar {
        margin-top: 1rem;
        overflow: auto;
        & > p {
            color: $white;
            font-weight: bold;
            text-align: center;
            font-size: 1rem;
            margin: 0 0 0.5rem 0;
        }
        &__day {
            @include flex-center-vert;
        }
        &__day-text {
            color: $white;
            font-weight: 500;
            margin-right: 0.75rem;
            font-size: 0.875rem;
            border-right: 1px solid $white;
            padding: 0.5rem 0.75rem 0.5rem 0;
            @media screen and (max-width: 480px) {
                font-size: 0.75rem;
                padding-right: 0.625rem;
                margin-right: 0.625rem;
            }
        }
        &__time-row {
            display: flex;
            gap: 0.5rem;
        }
        &__time {
            @include flex-center;
            font-size: 1rem;
            background-color: transparent;
            color: $white;
            font-weight: 500;
            line-height: 1;
            transition: $transition;
            cursor: pointer;
            font-size: 0.875rem;
            &--busy {
                opacity: 0;
            }
            @media screen and (max-width: 480px) {
                font-size: 0.75rem;
            }
        }
    }
</style>
