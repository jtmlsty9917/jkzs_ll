import { useState, useEffect, useCallback } from 'react'
import { getAllTodos, addTodo, toggleTodo, deleteTodo } from '../db'

/**
 * 待办事项 Hook
 */
export function useTodo() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const all = await getAllTodos()
    setTodos(all || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async ({ title, dueDate, dueTime }) => {
    await addTodo({ title, dueDate, dueTime })
    await load()
  }, [load])

  const toggle = useCallback(async (id) => {
    await toggleTodo(id)
    await load()
  }, [load])

  const remove = useCallback(async (id) => {
    await deleteTodo(id)
    await load()
  }, [load])

  return { todos, loading, add, toggle, remove, refresh: load }
}
