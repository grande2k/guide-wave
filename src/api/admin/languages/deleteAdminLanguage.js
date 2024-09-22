import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteAdminLanguage = async (params) => {
    try {
        const request_headers = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            data: params 
        };

        await axios.delete('https://guides-to-go.onrender.com/admin/delete_languages', request_headers);

        toast.success('Язык был успешно удален')
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error('Ошибка, попробуйте позже');
                break;
        }

        return [];
    }
}