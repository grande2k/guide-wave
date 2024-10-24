import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const updateBackground = async (data, photo) => {
    try {
        data.country_code = data.country_code.trim().toLowerCase();
        data.name = data.name.trim();
        data.name = data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();

        const request_params = { 
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            params: {
                country_code_old: data.country_code_old,
                country_code: data.country_code,
                photo_url_old: data.photo_url_old,
                name: data.name
            }
        };

        if(photo) {
            await axios.put('https://api.theguidewave.com/admin/background_photo_update', photo, request_params);
        } else {
            await axios.put('https://api.theguidewave.com/admin/background_photo_update', {}, request_params);
        }

        toast.success('Фон был успешно обновлен');
    } catch (err) {
        switch (err.response?.status) {
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}
