import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addCountry = async (params) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        await axios.post('https://api.theguidewave.com/admin/country_add', params, request_headers);
        toast.success('Страна была успешно добавлена');
    } catch (err) {
        if (err.response?.status === 422) {
            toast.error('Ошибка валидации');
        } else {
            toast.error('Ошибка, попробуйте позже');
        }
    }
}