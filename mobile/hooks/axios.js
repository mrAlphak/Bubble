//Custom axios function

import { useEffect, useState } from "react"
import axios from "axios"

<<<<<<< HEAD
export const base_url = 'http://192.168.96.111:8080/'
=======
export const base_url = 'YOUR LOCAL IP ADDRESS:8080'
>>>>>>> 4248a560ad1c30c582a1888a65ce952fa5085de8
export const instance = axios.create({
    baseURL: base_url,
    timeout: 10000,
    headers:{
        Accept: 'application/json',
    }
})

const useAxios=()=>{
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)

    const fetchData = async (url, data = null, method = 'get', params = null) => {
        setLoading(true);
        try {
            const headers = {
                ...instance.headers,
                ...params
            }
            const response = await instance({method, url, headers, data})
            if(response.data){
                return response.data
            }
        } catch (err) {
            console.log(err)
            return err
        }finally {
            setLoading(false)
        }
    }

    return {
        fetchData,
        loading,
        status,
        setStatus
    }
}

export default useAxios
