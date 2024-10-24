import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();

export const deleteGuide = async (params) => {
    try {
        const request_params = { data: params, headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.delete('https://api.theguidewave.com/admin/delete_guide', request_params);

        console.log(response.data);
        toast.success('Исполнитель был успешно удален');

        return response.data;
    } catch(err) {
        switch (err.response.status) {
            case 422:
                toast.error('Ошибка валидации');
                break;
            default:
                toast.error('Произошла ошибка, попробуйте позже');
                break;
        }
    }
}