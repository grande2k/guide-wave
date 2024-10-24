import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getInterface = async (locale) => {
    try {
        const params = { language: locale };
        const response = await axios.post('https://api.theguidewave.com/admin/interface_get', params);

        return response.data.interfaces;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error('Ошибка');
                break;
        }

        return [];
    }
}