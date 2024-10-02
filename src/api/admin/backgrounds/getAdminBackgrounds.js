import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const getAdminBackgrounds = async () => {
    try {
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.get('https://guides-to-go.onrender.com/admin/background_photo_admin', request_headers);
        console.log(response.data);
        return response.data.data;
    } catch (err) {
        switch (err.response.status) {
            default:
                toast.error('Ошибка при получении фонов');
                break;
        }

        return [];
    }
}