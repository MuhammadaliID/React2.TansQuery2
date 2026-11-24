
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import './App.css'
import { getTodos, deleteTodo, addTodo, editTodo } from './Srore/api'

function App() {
    let queryClient = useQueryClient()

    let [open, setOpen] = useState(false)
    let [selectedTodo, setSelectedTodo] = useState(null)
    let [search, setSearch] = useState("")

    let { register, handleSubmit, reset } = useForm()

    // GET
    let { data, isLoading, isError, error } = useQuery({
        queryKey: ["todos"],
        queryFn: getTodos
    })

    // DELETE
    let deleteMutation = useMutation({
        mutationFn: deleteTodo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
        }
    })

    // ADD
    let addMutation = useMutation({
        mutationFn: addTodo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
            closeDialog()
        }
    })

    // EDIT
    let editMutation = useMutation({
        mutationFn: editTodo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] })
            closeDialog()
        }
    })

    let isSaving = addMutation.isPending || editMutation.isPending

    // OPEN ADD
    let openAdd = () => {
        setSelectedTodo(null)
        reset({
            name: "",
            description: "",
            images: null
        })
        setOpen(true)
    }

    // OPEN EDIT
    let openEdit = (todo) => {
        setSelectedTodo(todo)
        reset({
            name: todo.name,
            description: todo.description,
            images: null
        })
        setOpen(true)
    }

    // CLOSE DIALOG
    function closeDialog() {
        setOpen(false)
        setSelectedTodo(null)
        reset()
    }

    // SUBMIT
    let submit = (data) => {
        if (selectedTodo) {
            editMutation.mutate({
                id: selectedTodo.id,
                data: data
            })
        } else {
            addMutation.mutate(data)
        }
    }

    // SEARCH
    let filteredTodos = data?.filter((todo) =>
        todo.name?.toLowerCase().includes(search.toLowerCase()) ||
        todo.description?.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) return <h1>Loading...</h1>

    if (isError) return <h1>{error.message}</h1>

    return (
        <div style={{ padding: "30px", fontFamily: "Arial", background: "#f4f6fb", minHeight: "100vh" }}>

            <h1 style={{ color: "#1e293b", fontSize: "32px" }}>My Todos</h1>

            {/* SEARCH + ADD */}
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "25px" }}>

                <input
                    type="text"
                    placeholder="Search todos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: "12px", width: "100%", maxWidth: "350px", border: "1px solid #ddd", borderRadius: "8px", outline: "none", boxSizing: "border-box" }}
                />

                <button onClick={openAdd} style={{ padding: "12px 22px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    + Add Todo
                </button>

            </div>

            {/* TODO LIST */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>

                {filteredTodos?.map((todo) => (
                    <div key={todo.id} style={{ padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 3px 12px #0001" }}>

                        <h3 style={{ color: "#1e293b" }}>{todo.name}</h3>

                        <p style={{ color: "#64748b" }}>{todo.description}</p>

                        {/* IMAGES */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {todo.images?.map((image) => (
                                <img key={image.id} src={`https://to-dos-api.softclub.tj/images/${image.imageName}`} alt={todo.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                            ))}
                        </div>

                        {/* BUTTONS */}
                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>

                            <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(todo.id)} style={{ padding: "9px 15px", background: "#ef4444", color: "white", border: "none", borderRadius: "7px", cursor: "pointer" }}>
                                Delete
                            </button>

                            <button onClick={() => openEdit(todo)} style={{ padding: "9px 15px", background: "#f59e0b", color: "white", border: "none", borderRadius: "7px", cursor: "pointer" }}>
                                Edit
                            </button>

                        </div>

                    </div>
                ))}

            </div>

            {/* EMPTY SEARCH */}
            {filteredTodos?.length === 0 && (
                <h2 style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}>
                    No todos found
                </h2>
            )}

            {/* DIALOG */}
            {open && (
                <div onClick={closeDialog} style={{ position: "fixed", inset: 0, background: "#0009", display: "flex", justifyContent: "center", alignItems: "center", padding: "15px" }}>

                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit(submit)} style={{ background: "white", padding: "30px", borderRadius: "15px", width: "100%", maxWidth: "400px", boxSizing: "border-box" }}>

                        <h2 style={{ marginTop: 0, color: "#1e293b" }}>
                            {selectedTodo ? "Edit Todo" : "Add Todo"}
                        </h2>

                        <label>Name</label>

                        <input
                            {...register("name", { required: "Name is required" })}
                            placeholder="Enter name"
                            style={{ width: "100%", padding: "12px", margin: "8px 0 15px", border: "1px solid #ddd", borderRadius: "7px", boxSizing: "border-box" }}
                        />

                        <label>Description</label>

                        <textarea
                            {...register("description", { required: "Description is required" })}
                            placeholder="Enter description"
                            style={{ width: "100%", height: "100px", padding: "12px", margin: "8px 0 15px", border: "1px solid #ddd", borderRadius: "7px", boxSizing: "border-box" }}
                        />

                        <label>Images</label>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            {...register("images", {
                                required: selectedTodo ? false : "Image is required"
                            })}
                            style={{ display: "block", margin: "10px 0 20px" }}
                        />

                        <div style={{ display: "flex", gap: "10px" }}>

                            <button type="submit" disabled={isSaving} style={{ flex: 1, padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "7px", cursor: "pointer" }}>
                                {isSaving ? "Saving..." : selectedTodo ? "Save Changes" : "Add"}
                            </button>

                            <button type="button" onClick={closeDialog} style={{ padding: "12px", background: "#64748b", color: "white", border: "none", borderRadius: "7px", cursor: "pointer" }}>
                                Cancel
                            </button>

                        </div>

                        {addMutation.isError && <p style={{ color: "red" }}>{addMutation.error.response?.data?.title || addMutation.error.message}</p>}

                        {editMutation.isError && <p style={{ color: "red" }}>{editMutation.error.response?.data?.title || editMutation.error.message}</p>}

                    </form>
                </div>
            )}

        </div>
    )
}

export default App
