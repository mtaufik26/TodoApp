'use client';

import { useState, useEffect } from 'react';
import { useTodos } from '../../hooks/useTodos';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  X,
  Plus,
  ListTodo,
  Calendar,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import Navbar from '../../components/navbar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface JwtPayload {
  role: string;
  fullName?: string;
  [key: string]: any;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (err) {
    console.error('Failed to parse JWT', err);
    return null;
  }
}

export default function TodoPage() {
  const [newTitle, setNewTitle] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      setRole(decoded?.role || null);
    } else {
      setRole(null);
    }
  }, [token]);

  const { todosQuery, addTodo, toggleTodo, removeTodo } = useTodos(1000);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addTodo.mutate(
      { title: newTitle },
      {
        onSuccess: () => {
          toast.success('Todo created successfully!');
          setNewTitle('');
        },
        onError: (error: any) => {
          console.error(error);
          toast.error('Failed to create todo');
        },
      }
    );
  };

  const handleGoAdmin = () => {
    router.push('/auth/admin');
  };

  const handleCheckbox = (todo: { id: string; done: boolean }) => {
    if (deleteMode) {
      setSelectedIds((prev) =>
        prev.includes(todo.id)
          ? prev.filter((sid) => sid !== todo.id)
          : [...prev, todo.id]
      );
    } else {
      toggleTodo.mutate(
        { id: todo.id, done: !todo.done },
        {
          onError: (error: any) => {
            console.error(error);
            toast.error('Failed to update todo status');
          },
        }
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map((id) => removeTodo.mutateAsync(id)));
      toast.success('Selected todos deleted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete some todos');
    } finally {
      setSelectedIds([]);
      setDeleteMode(false);
    }
  };

  const handleCancelDelete = () => {
    setSelectedIds([]);
    setDeleteMode(false);
  };

  const getFilteredTodos = () => {
    const todos = todosQuery.data || [];
    return showAll ? todos : todos.slice(0, 4);
  };

  if (todosQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4">
        <Navbar />
        <div className="max-w-2xl mx-auto pt-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (todosQuery.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4">
        <Navbar />
        <div className="max-w-2xl mx-auto pt-8">
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
            Error loading todos
          </div>
        </div>
      </div>
    );
  }

  const todos = todosQuery.data || [];
  const displayedTodos = getFilteredTodos();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-xl mx-auto relative z-10">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg">
                    <ListTodo className="w-5 h-5 text-sky-600" />
                  </div>
                  Tasks
                  {deleteMode && (
                    <Badge variant="destructive" className="ml-2">
                      Delete Mode
                    </Badge>
                  )}
                </CardTitle>

                {/* Admin Page Button */}
                {role === 'ADMIN' && (
                  <Button
                    onClick={handleGoAdmin}
                    className="bg-sky-500 hover:bg-sky-600 text-white shadow-md"
                  >
                    Admin Page
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Add Todo Form */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="What needs to be done?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="h-12 pl-4 pr-12 border-gray-200 rounded-lg bg-white/70 backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 focus:bg-white"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={addTodo.isLoading || !newTitle.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Todo List */}
              <div className="space-y-3">
                {displayedTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <ListTodo className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks found</h3>
                  </div>
                ) : (
                  displayedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`group flex items-center p-4 rounded-xl border transition-all duration-200 ${
                        deleteMode && selectedIds.includes(todo.id)
                          ? 'bg-red-50 border-red-200 shadow-md'
                          : todo.done
                          ? 'bg-green-50 border-green-200 hover:shadow-md'
                          : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <Checkbox
                          checked={deleteMode ? selectedIds.includes(todo.id) : todo.done}
                          onCheckedChange={() => handleCheckbox(todo)}
                          className={`h-5 w-5 rounded-md transition-all duration-200 ${
                            deleteMode 
                              ? 'data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500' 
                              : 'data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500'
                          }`}
                          aria-label={deleteMode ? "Select for deletion" : "Mark as done"}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium transition-all duration-200 ${
                            todo.done ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}>
                            {todo.title}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                        <Badge 
                          variant={todo.done ? 'default' : 'secondary'} 
                          className={`${
                            todo.done 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-orange-100 text-orange-700 border-orange-200'
                          }`}
                        >
                          {todo.done ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Done
                            </>
                          ) : (
                            <>
                              <Circle className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Action Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <div className="flex gap-3 flex-1">
                  <Button
                    variant="outline"
                    className="flex-1 border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300"
                    onClick={() => setShowAll((prev) => !prev)}
                  >
                    {showAll ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show All
                      </>
                    )}
                  </Button>
                  
                  {!deleteMode ? (
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      onClick={() => setDeleteMode(true)}
                      disabled={todos.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Mode
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                      onClick={handleCancelDelete}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Delete Selected Button */}
                {deleteMode && selectedIds.length > 0 && (
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 shadow-lg"
                    onClick={handleDeleteSelected}
                    disabled={removeTodo.isLoading}
                  >
                    {removeTodo.isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete Selected ({selectedIds.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
