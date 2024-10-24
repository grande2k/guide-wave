import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateCountry = async (params) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.put('https://api.theguidewave.com/admin/country_update', params, request_headers);
        toast.success('Страна была успешно обновлена');
    } catch (err) {
        if (err.response?.status === 422) {
            toast.error('Ошибка валидации');
        } else {
            toast.error('Ошибка, попробуйте позже');
        }
    }
};
