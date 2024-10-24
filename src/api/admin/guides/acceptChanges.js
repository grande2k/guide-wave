import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const acceptChanges = async (id) => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };

        const params = {
            user_id: id
        };

        const response = await axios.post('https://api.theguidewave.com/admin/accept_changes', params, request_headers);

        console.log(response.data);

        toast.success('Изменения подтверждены')

        return response.data;
    } catch(err) {
        switch (err.response.status) {
            case 422:
                toast.error('Ошибка валидации');
                break;
            default:
                toast.error('Произошла ошибка');
                break;
        }
    }
}