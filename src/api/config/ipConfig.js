import { get,post } from "@/utils/request";

export const getLocalIpService = ()=>{
    return get('/local/ip')
}