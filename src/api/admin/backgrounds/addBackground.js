import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const addBackground = async (data, photo) => {
    try {
        data.country_code  = data.country_code .trim().toLowerCase();
        data.name = data.name.trim();
        data.name = data.name.charAt(0).toUpperCase() + data.name.slice(1).toLowerCase();

        const request_params = { 
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            params: { country_code : data.country_code , name: data.name }
        };
        
        await axios.post('https://guides-to-go.onrender.com/admin/background_photo_add', photo, request_params);
        toast.success('Фон был успешно добавлен');
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error('Ошибка валидации');
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}