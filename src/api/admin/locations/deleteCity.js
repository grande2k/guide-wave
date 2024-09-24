import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteCity = async (params) => {
    try {
        const request_headers = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            data: { city_names: params } 
        };

        await axios.delete('https://guides-to-go.onrender.com/admin/city_delete', request_headers);

        toast.success('Город был успешно удален')
    } catch (err) {
        switch (err.response.status) {
            case 422:
                toast.error('Неправильные данные');
                break;
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}