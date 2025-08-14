import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTodos, createTodo, markTodo, deleteTodo } from '../services/todos';

/** Interface untuk object Todo */
interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt?: string;
}

/** Custom hook untuk operasi CRUD Todo */
export const useTodos = (rows = 4) => {
  const queryClient = useQueryClient(); // react-query client

  /** Query untuk mengambil daftar todos */
  const todosQuery = useQuery<Todo[], Error>(
    ['todos', rows],            // Key query unik
    () => getTodos({ rows }),   // Fungsi fetch
    {
      initialData: [],          // Data awal kosong
    }
  );

  /** Mutation untuk menambah todo baru */
  const addTodo = useMutation(createTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos', rows]); // Refresh list setelah berhasil
    },
    onError: (error: any) => {
      console.error('Failed to add todo:', error); // Log error
    },
  });

  /** Mutation untuk toggle status todo (done/pending) */
  const toggleTodo = useMutation(
    ({ id, done }: { id: string; done: boolean }) => markTodo({ id, done }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todos', rows]); // Refresh list setelah berhasil
      },
      onError: (error: any) => {
        console.error('Failed to toggle todo:', error); // Log error
      },
    }
  );

  /** Mutation untuk menghapus todo */
  const removeTodo = useMutation(deleteTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos', rows]); // Refresh list setelah berhasil
    },
    onError: (error: any) => {
      console.error('Failed to delete todo:', error); // Log error
    },
  });

  return { todosQuery, addTodo, toggleTodo, removeTodo, queryClient };
};
