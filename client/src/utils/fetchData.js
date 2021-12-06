import axiosClient from './axiosClient'

export const getDataAPI = async (url, token) => {
    const res = await axiosClient.get(`/api/${url}`, {
        headers: { Authorization: token}
    })
    return res;
}

export const postDataAPI = async (url, post, token) => {
    const res = await axiosClient.post(`/api/${url}`, post, {
        headers: { Authorization: token}
    })
    return res;
}

export const putDataAPI = async (url, post, token) => {
    const res = await axiosClient.put(`/api/${url}`, post, {
        headers: { Authorization: token}
    })
    return res;
}

export const patchDataAPI = async (url, post, token) => {
    const res = await axiosClient.patch(`/api/${url}`, post, {
        headers: { Authorization: token}
    })
    return res;
}

export const deleteDataAPI = async (url, token) => {
    const res = await axiosClient.delete(`/api/${url}`, {
        headers: { Authorization: token}
    })
    return res;
}