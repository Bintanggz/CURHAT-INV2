
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Comments({ auth }) {
    const [comments, setComments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        category_id: '',
        status_id: ''
    });
    const [loading, setLoading] = useState(false);

    // Fetch Initial Data (Dropdowns)
    useEffect(() => {
        axios.get('/api/categories').then(res => setCategories(res.data));
        axios.get('/api/statuses').then(res => setStatuses(res.data));
        fetchComments();
    }, []);

    // Fetch Comments based on filters
    const fetchComments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await axios.get(`/api/comments?${params}`);
            setComments(response.data.data); // Pagination data.data
        } catch (error) {
            console.error("Error fetching comments", error);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Apply filters when values change (or use a button)
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchComments();
        }, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [filters]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchComments();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleUpdate = async (id, field, value) => {
        // Optimistic update
        const updatedComments = comments.map(c => 
            c.id === id ? { ...c, [field]: value } : c
        );
        setComments(updatedComments);

        // Cari comment yang sedang diedit untuk mendapatkan nilai lengkap category_id dan status_id
        const comment = comments.find(c => c.id === id);
        
        try {
            await axios.put(`/api/comments/${id}`, {
                category_id: field === 'category_id' ? value : comment.category_id,
                status_id: field === 'status_id' ? value : comment.status_id
            });
        } catch (error) {
            console.error("Failed to update", error);
            fetchComments(); // Revert on error
        }
    };

    const handleFetchInstagram = async () => {
        if (!confirm('Fetch data terbaru dari Instagram?')) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/instagram/fetch');
            if (response.data.status === 'success') {
                alert('Sync Berhasil! Komentar baru: ' + response.data.new_comments);
                fetchComments();
            } else {
                alert('Gagal Sync: ' + response.data.message);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            alert('Gagal Sync: ' + errorMsg);
        }
        setLoading(false);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Admin Komentar Aspirasi</h2>}
        >
            <Head title="Admin Comments" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            {/* Actions & Filters */}
                            <div className="mb-6 flex flex-wrap gap-4 items-end justify-between">
                                <div className="flex gap-4 flex-wrap">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
                                        <input type="date" name="start_date" className="border rounded p-2 text-black" onChange={handleFilterChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
                                        <input type="date" name="end_date" className="border rounded p-2 text-black" onChange={handleFilterChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Kategori</label>
                                        <select name="category_id" className="border rounded p-2 text-black" onChange={handleFilterChange}>
                                            <option value="">Semua</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select name="status_id" className="border rounded p-2 text-black" onChange={handleFilterChange}>
                                            <option value="">Semua</option>
                                            {statuses.map(st => (
                                                <option key={st.id} value={st.id}>{st.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleFetchInstagram}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Sync Instagram'}
                                </button>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TANGGAL</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PENGGUNA</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ASPIRASI</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">POSTINGAN</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">KATEGORI</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {comments.map((comment) => (
                                            <tr key={comment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    <div>{new Date(comment.timestamp).toLocaleDateString('id-ID')}</div>
                                                    <div className="text-xs font-semibold">{new Date(comment.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">{comment.from_name}</td>
                                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs overflow-hidden text-ellipsis" title={comment.message}>
                                                    {comment.message}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <a 
                                                        href={`${comment.post?.permalink}c/${comment.instagram_id}/`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-600 focus:bg-gray-200 dark:focus:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition ease-in-out duration-150"
                                                    >
                                                        Lihat
                                                    </a>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <select 
                                                        value={comment.category_id || ''} 
                                                        onChange={(e) => handleUpdate(comment.id, 'category_id', e.target.value)}
                                                        className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm text-xs p-1"
                                                    >
                                                        <option value="">- Pilih -</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    <select 
                                                        value={comment.status_id} 
                                                        onChange={(e) => handleUpdate(comment.id, 'status_id', e.target.value)}
                                                        className={`border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm text-xs font-bold p-1 ${
                                                            comment.status_id == 1 ? 'text-red-500' : 
                                                            comment.status_id == 2 ? 'text-yellow-500' : 'text-green-500'
                                                        }`}
                                                    >
                                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-sm">
                                                    {/* Placeholder untuk Aksi lain jika diperlukan */}
                                                </td>
                                            </tr>
                                        ))}
                                        {comments.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">Tidak ada data. Silakan Sync Instagram.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
