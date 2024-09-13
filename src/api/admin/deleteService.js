import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteService = async (params, t) => {
    try {
        const request_headers = {
            headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` },
            data: params 
        };

        const response = await axios.delete('https://guides-to-go.onrender.com/admin/delete_service', request_headers);

        console.log(response.data);

        return response.data;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error(t('errors.default'));
                break;
        }

        return [];
    }
}