import api from '../lib/api';
import { getToken } from '../store/authStore';

/** Interface todo yang digunakan di frontend */
export interface Todo {
  id: string;
  title: string;
  done: boolean;
}

/** Map data todo dari API ke format Todo */
const mapTodo = (todo: any): Todo => ({
  id: todo.id,
  title: todo.item,   // map 'item' dari API ke 'title'
  done: todo.isDone,  // map 'isDone' ke 'done'
});

/** Ambil list todo dari server */
export const getTodos = async ({ rows = 4 } = {}) => {
  const token = getToken();
  if (!token) throw new Error('Token not available');

  const res = await api.get('/todos', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      orderKey: 'createdAt', // urut berdasarkan tanggal dibuat
      orderRule: 'desc',     // urut descending
      page: 1,
      rows,                  // jumlah baris
    },
  });

  const todosArray = Array.isArray(res.data.content?.entries)
    ? res.data.content.entries
    : [];

  return todosArray.map(mapTodo); // konversi ke format frontend
};

/** Buat todo baru */
export const createTodo = async (todo: { title: string }) => {
  const token = getToken();
  if (!token) throw new Error('Token not available');
  try {
    const res = await api.post(
      '/todos',
      { item: todo.title }, // kirim sebagai 'item'
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return mapTodo(res.data.content); // konversi response
  } catch (error: any) {
    console.error('Error createTodo:', error.response?.data || error.message);
    throw error;
  }
};

/** Tandai todo sebagai done/undone */
export const markTodo = async ({ id, done }: { id: string; done: boolean }): Promise<Todo> => {
  const token = getToken();
  if (!token) throw new Error('Token not available');

  const action = done ? 'DONE' : 'UNDONE';

  const res = await api.put(
    `/todos/${id}/mark`,
    { action },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data || !res.data.content) {
    throw new Error('Invalid API response');
  }

  return mapTodo(res.data.content); // konversi ke format frontend
};

/** Hapus todo berdasarkan ID */
export const deleteTodo = async (id: string): Promise<string> => {
  const token = getToken();
  if (!token) throw new Error('Token not available');

  const res = await api.delete(`/todos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.data?.message !== 'successfully deleted todo !') {
    throw new Error(res.data?.message || 'Gagal menghapus todo');
  }

  return id; // kembalikan id todo yang dihapus
};
