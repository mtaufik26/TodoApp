'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '../../../components/navbar';
import { 
  ListTodo,
  CheckCircle2,
  Circle,
  Search,
  Eye,
  EyeOff,
  Filter,
  ChevronRight,
  Users,
  Clock,
  CheckCheck,
  AlertCircle,
  List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface JwtPayload {
  role: string;
  fullName?: string;
  [key: string]: any;
}

interface Todo {
  id: string;
  item: string;
  fullName?: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  user?: {
    name?: string;
    email?: string;
  };
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

const getCreatorName = (todo: Todo): string => {
  if (todo.user?.name) return todo.user.name;
  if (todo.fullName) return todo.fullName;
  if (todo.createdBy) return todo.createdBy;
  if (todo.user?.email) return todo.user.email.split('@')[0];
  return 'Unknown User';
};

// Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function AdminPage() {
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchTodos = useCallback(async (searchTerm = '') => {
    if (!token) {
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const url = 'https://fe-test-api.nwappservice.com/todos';
    
    try {
      const params = new URLSearchParams();

      if (filterMode === 'completed') {
        params.append('filters', JSON.stringify({ isDone: true }));
      } else if (filterMode === 'pending') {
        params.append('filters', JSON.stringify({ isDone: false }));
      }

      if (searchTerm) {
        params.append(
          'searchFilters',
          JSON.stringify({
            item: searchTerm,
            fullName: searchTerm,
            createdBy: searchTerm,
            'user.name': searchTerm
          })
        );
      }

      params.append('orderKey', 'createdAt');
      params.append('orderRule', 'desc');
      params.append('page', '1');
      params.append('rows', showAll ? '999999' : '50');

      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`API search failed with status ${response.status}, trying fallback...`);
        throw new Error(`API search failed (${response.status})`);
      }

      const data = await response.json();
      const todos = Array.isArray(data.content?.entries) ? data.content.entries : [];
      setFilteredTodos(todos);
      setAllTodos(todos);
    } catch (error) {
      try {
        const fallbackParams = new URLSearchParams();
        fallbackParams.append('orderKey', 'createdAt');
        fallbackParams.append('orderRule', 'desc');
        fallbackParams.append('page', '1');
        fallbackParams.append('rows', showAll ? '999999' : '200');

        const allResponse = await fetch(`${url}?${fallbackParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!allResponse.ok) {
          const errorText = await allResponse.text();
          console.error('Fallback fetch failed:', {
            status: allResponse.status,
            statusText: allResponse.statusText,
            errorText
          });
          throw new Error(`Failed to fetch todos: ${allResponse.status} ${allResponse.statusText}`);
        }

        const allData = await allResponse.json();
        const allTodos = Array.isArray(allData.content?.entries) ? allData.content.entries : [];
        setAllTodos(allTodos);

        let result = [...allTodos];
        
        if (filterMode === 'completed') {
          result = result.filter(todo => todo.isDone);
        } else if (filterMode === 'pending') {
          result = result.filter(todo => !todo.isDone);
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          result = result.filter((todo) =>
            todo.item?.toLowerCase().includes(term) ||
            todo.fullName?.toLowerCase().includes(term) ||
            todo.createdBy?.toLowerCase().includes(term) ||
            (todo.user?.name && todo.user.name.toLowerCase().includes(term))
          );
        }

        setFilteredTodos(result);
      } catch (fallbackError) {
        console.error('Complete fetch failure:', fallbackError);
        setError(fallbackError instanceof Error ? fallbackError.message : 'Failed to load todos');
        toast.error('Failed to load todos. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, filterMode, showAll]);

  const debouncedFetchTodos = useCallback(
    debounce((search: string) => {
      fetchTodos(search);
    }, 500),
    [fetchTodos]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    debouncedFetchTodos(value);
  };

  useEffect(() => {
    setMounted(true);

    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.role === 'ADMIN') {
        setRole(decoded.role);
        fetchTodos(searchTerm);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [token, router, filterMode, showAll, fetchTodos, debouncedFetchTodos]);

  if (!mounted || role !== 'ADMIN') return null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="hidden border-r bg-white/80 backdrop-blur-sm lg:block w-64 shadow-sm"></div>
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
        <div className="hidden border-r bg-white/80 backdrop-blur-sm lg:block w-64 shadow-sm"></div>
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-6">
            <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-red-800">Error Loading Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => fetchTodos(searchTerm)}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const completedCount = allTodos.filter(todo => todo.isDone).length;
  const pendingCount = allTodos.filter(todo => !todo.isDone).length;

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className="hidden border-r bg-white/80 backdrop-blur-sm lg:block w-64 shadow-sm">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b border-sky-100 px-6 bg-gradient-to-r from-sky-500 to-blue-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <List className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid items-start px-4 gap-2">
              <Button 
                variant="ghost" 
                className="justify-start gap-3 text-sky-700 hover:bg-sky-100 hover:text-sky-800 rounded-lg transition-all duration-200"
              >
                <ListTodo className="h-4 w-4" />
                Task Management
              </Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 p-6">
          <div className="space-y-8">

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-0 bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardDescription className="text-sky-100">Total Tasks</CardDescription>
                      <CardTitle className="text-3xl font-bold">{allTodos.length}</CardTitle>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <ListTodo className="h-6 w-6" />
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardDescription className="text-emerald-100">Completed</CardDescription>
                      <CardTitle className="text-3xl font-bold">{completedCount}</CardTitle>
                      <p className="text-sm text-emerald-100 mt-1">
                        {allTodos.length > 0 ? Math.round((completedCount / allTodos.length) * 100) : 0}% complete
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CheckCheck className="h-6 w-6" />
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardDescription className="text-amber-100">Pending</CardDescription>
                      <CardTitle className="text-3xl font-bold">{pendingCount}</CardTitle>
                      <p className="text-sm text-amber-100 mt-1">
                        {allTodos.length > 0 ? Math.round((pendingCount / allTodos.length) * 100) : 0}% remaining
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Search and Filter Section */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sky-400" />
                    <Input
                      placeholder="Search tasks, creators, or keywords..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="pl-11 h-12 border-sky-200 focus:border-sky-500 focus:ring-sky-500 rounded-xl"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 h-12 px-4 border-sky-200 text-sky-700 hover:bg-sky-50 rounded-xl">
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filter</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="flex gap-1 p-2 bg-white border-sky-200">
                          <Button 
                            variant={filterMode === 'all' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setFilterMode('all')}
                            className={filterMode === 'all' ? 'bg-sky-500 hover:bg-sky-600' : 'hover:bg-sky-50 text-sky-700'}
                          >
                            All
                          </Button>
                          <Button 
                            variant={filterMode === 'pending' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setFilterMode('pending')}
                            className={filterMode === 'pending' ? 'bg-sky-500 hover:bg-sky-600' : 'hover:bg-sky-50 text-sky-700'}
                          >
                            Pending
                          </Button>
                          <Button 
                            variant={filterMode === 'completed' ? 'default' : 'ghost'} 
                            size="sm" 
                            onClick={() => setFilterMode('completed')}
                            className={filterMode === 'completed' ? 'bg-sky-500 hover:bg-sky-600' : 'hover:bg-sky-50 text-sky-700'}
                          >
                            Completed
                          </Button>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 h-12 px-4 border-sky-200 text-sky-700 hover:bg-sky-50 rounded-xl"
                      onClick={() => setShowAll((prev) => !prev)}
                    >
                      {showAll ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Show Less</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Show All</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="bg-sky-200" />

            {/* Task List Section */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 rounded-lg">
                      <ListTodo className="h-5 w-5 text-sky-600" />
                    </div>
                    <CardTitle className="text-xl text-sky-800">Task Management</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50">
                    {paginatedTodos.length} of {filteredTodos.length} tasks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedTodos.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-sky-200 rounded-xl bg-sky-50/30">
                      <div className="p-4 bg-sky-100 rounded-full w-fit mx-auto mb-4">
                        <ListTodo className="h-8 w-8 text-sky-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-sky-800 mb-2">No tasks found</h3>
                      <p className="text-sky-600">Try adjusting your search criteria or filters</p>
                    </div>
                  ) : (
                    paginatedTodos.map((todo, index) => (
                      <div 
                        key={todo.id} 
                        className={`group flex items-center p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                          todo.isDone 
                            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300' 
                            : 'bg-white border-sky-200 hover:border-sky-300 hover:shadow-lg'
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="flex-1 space-y-2">
                          <div className={`flex items-center gap-3 ${todo.isDone ? 'line-through text-gray-600' : 'text-gray-800'}`}>
                            {todo.isDone ? (
                              <div className="p-1 bg-emerald-100 rounded-full">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="p-1 bg-sky-100 rounded-full">
                                <Circle className="h-5 w-5 text-sky-600" />
                              </div>
                            )}
                            <span className="font-medium">{todo.item}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-3 ml-8">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{getCreatorName(todo)}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(todo.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-sky-500 transition-colors duration-200" />
                      </div>
                    ))
                  )}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-sky-100">
                    <div className="text-sm text-sky-600">
                      Page {currentPage} of {totalPages} ({filteredTodos.length} total items)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="border-sky-200 text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                      >
                        Previous
                      </Button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={
                              currentPage === pageNum
                                ? "bg-sky-500 hover:bg-sky-600 text-white"
                                : "border-sky-200 text-sky-700 hover:bg-sky-50"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="border-sky-200 text-sky-700 hover:bg-sky-50 disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}