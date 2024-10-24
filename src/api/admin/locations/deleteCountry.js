import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteCountry = async (country_id) => {
    try {
        const request_headers = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            data: { id: country_id } 
        };

        await axios.delete('https://api.theguidewave.com/admin/country_delete', request_headers);

        toast.success('Страна была успешно удалена')
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