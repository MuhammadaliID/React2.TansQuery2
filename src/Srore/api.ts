
import axios from "axios"

let API = "https://to-dos-api.softclub.tj/api/to-dos"

export let getTodos = async () => {
    let response = await axios.get(API)
    return response.data.data
}

export let deleteTodo = async (id) => {
    let response = await axios.delete(`${API}?id=${id}`)
    return response.data
}

export let addTodo = async (data) => {
    let formData = new FormData()

    formData.append("Name", data.name)
    formData.append("Description", data.description)

    Array.from(data.images || []).forEach((image) => {
        formData.append("Images", image)
    })

    let response = await axios.post(API, formData)
    return response.data
}

export let editTodo = async ({ id, data }) => {
    let formData = new FormData()

    formData.append("Name", data.name)
    formData.append("Description", data.description)

    Array.from(data.images || []).forEach((image) => {
        formData.append("Images", image)
    })

    let response = await axios.put(`${API}?id=${id}`, formData)
    return response.data
}
