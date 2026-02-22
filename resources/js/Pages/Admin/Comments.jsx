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
    const [activeTab, setActiveTab] = useState('comment');

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
            const data = response.data.data || response.data;
            setComments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching comments", error);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Apply filters when values change
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchComments();
        }, 500);
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
        const item = comments.find(c => c.id === id);
        if (!item) return;

        const updatedComments = comments.map(c => 
            c.id === id ? { ...c, [field]: value } : c
        );
        setComments(updatedComments);
        
        try {
            await axios.put(`/api/comments/${id}`, {
                category_id: field === 'category_id' ? value : item.category_id,
                status_id: field === 'status_id' ? value : item.status_id,
                type: item.type // Kirim tipe agar backend tahu tabel mana yang diupdate
            });
        } catch (error) {
            console.error("Failed to update", error);
            fetchComments();
        }
    };

    const handleFetchInstagram = async () => {
        if (!confirm('Fetch data terbaru dari Instagram?')) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/instagram/fetch');
            if (response.data.status === 'success') {
                alert(`Sync Berhasil!\nKomentar baru: ${response.data.new_comments}\nDM baru: ${response.data.new_messages}`);
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
        <AuthenticatedLayout user={auth.user}>
            <Head title="CURHATIN - Admin" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #f5f7fa;
                    color: #2d3748;
                    line-height: 1.6;
                }

                .curhatin-header {
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1.75rem 0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 2.5rem;
                }

                .curhatin-brand {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .curhatin-logo {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .curhatin-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .curhatin-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    letter-spacing: -0.025em;
                }

                .curhatin-subtitle {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin: 0;
                }

                .filter-section {
                    background: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .filter-header {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 0.5rem;
                }

                .form-control,
                .form-select {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    font-size: 0.9375rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    background-color: #ffffff;
                    transition: border-color 0.15s ease;
                    color: #1e293b;
                }

                .form-control:focus,
                .form-select:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
                }

                .btn-primary-custom {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    padding: 0.625rem 1.5rem;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .btn-primary-custom:hover {
                    background: #1d4ed8;
                }

                .btn-primary-custom:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                }

                .btn-sync {
                    background: #10b981;
                    color: #ffffff;
                    border: none;
                    padding: 0.625rem 1.5rem;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .btn-sync:hover {
                    background: #059669;
                }

                .btn-sync:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                }

                .data-section {
                    background: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }

                .data-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #e2e8f0;
                    background: #fafbfc;
                }

                .data-header h2 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0;
                }

                .table-container {
                    overflow-x: auto;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .data-table thead th {
                    background: #f8fafc;
                    padding: 1rem 1.5rem;
                    text-align: left;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #e2e8f0;
                    white-space: nowrap;
                }

                .data-table tbody td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.9375rem;
                    color: #334155;
                }

                .data-table tbody tr:hover {
                    background-color: #f9fafb;
                }

                .data-table tbody tr:last-child td {
                    border-bottom: none;
                }

                .user-info {
                    font-weight: 500;
                    color: #1e293b;
                }

                .date-info {
                    color: #64748b;
                    font-size: 0.875rem;
                }

                .text-content {
                    max-width: 400px;
                    line-height: 1.5;
                }

                .btn-link {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: #f1f5f9;
                    color: #475569;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    border: 1px solid #e2e8f0;
                }

                .btn-link:hover {
                    background: #e2e8f0;
                    color: #334155;
                }

                .form-select-inline {
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    background-color: #ffffff;
                    min-width: 150px;
                    cursor: pointer;
                    color: #1e293b;
                }

                .form-select-inline:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
                }

                .empty-state {
                    padding: 4rem 2rem;
                    text-align: center;
                }

                .empty-state-icon {
                    width: 64px;
                    height: 64px;
                    background: #f1f5f9;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    font-size: 1.5rem;
                    color: #94a3b8;
                }

                .empty-state h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #475569;
                    margin-bottom: 0.5rem;
                }

                .empty-state p {
                    color: #94a3b8;
                    font-size: 0.9375rem;
                }

                .container-custom {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                @media (max-width: 768px) {
                    .filter-section {
                        padding: 1.5rem;
                    }

                    .data-header {
                        padding: 1.25rem 1rem;
                    }

                    .data-table thead th,
                    .data-table tbody td {
                        padding: 1rem;
                        font-size: 0.875rem;
                    }

                    .curhatin-title {
                        font-size: 1.25rem;
                    }
                }

                .tab-navigation {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 0px;
                }

                .tab-button {
                    padding: 0.75rem 1.5rem;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #64748b;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s ease;
                }

                .tab-button:hover {
                    color: #1e293b;
                }

                .tab-button.active {
                    color: #2563eb;
                    border-bottom-color: #2563eb;
                }
            `}</style>

            <div className="curhatin-header">
                <div className="container-custom">
                    <div className="curhatin-brand">
                        <div className="curhatin-logo">
                            <img src="/logo-diskominfo.png" alt="Diskominfo Logo" />
                        </div>
                        <div>
                            <h1 className="curhatin-title">CURHAT-IN</h1>
                            <p className="curhatin-subtitle">Curahan Hati Aspirasi Terintegrasi Instagram</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom">
                <section className="filter-section">
                    <div className="filter-header">
                        <span>Filter Data</span>
                        <button 
                            onClick={handleFetchInstagram}
                            className="btn-sync"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Sync Instagram'}
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Dari Tanggal</label>
                            <input 
                                type="date" 
                                name="start_date" 
                                className="form-control" 
                                value={filters.start_date}
                                onChange={handleFilterChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sampai Tanggal</label>
                            <input 
                                type="date" 
                                name="end_date" 
                                className="form-control" 
                                value={filters.end_date}
                                onChange={handleFilterChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Kategori</label>
                            <select 
                                name="category_id" 
                                className="form-select"
                                value={filters.category_id}
                                onChange={handleFilterChange}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select 
                                name="status_id" 
                                className="form-select"
                                value={filters.status_id}
                                onChange={handleFilterChange}
                            >
                                <option value="">Semua Status</option>
                                {statuses.map(st => (
                                    <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'comment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comment')}
                    >
                        Tabel Komentar
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'dm' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dm')}
                    >
                        Tabel DM
                    </button>
                </div>

                <section className="data-section">
                    <div className="data-header">
                        <h2>Daftar Aspirasi ({activeTab === 'comment' ? 'Komentar' : 'Direct Message'})</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Pengguna</th>
                                    <th>Aspirasi</th>
                                    {activeTab === 'comment' ? <th>Postingan</th> : <th>Sumber</th>}
                                    <th>Kategori</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments
                                    .filter(c => c.type === activeTab)
                                    .map((comment) => (
                                    <tr key={comment.id}>
                                        <td>
                                            <div className="date-info">
                                                {new Date(comment.timestamp).toLocaleDateString('id-ID')}
                                            </div>
                                            <div className="date-info">
                                                {new Date(comment.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-info">{comment.from_name}</div>
                                        </td>
                                        <td>
                                            <div className="text-content">{comment.message}</div>
                                        </td>
                                        <td>
                                            {comment.type === 'comment' ? (
                                                <a 
                                                    href={`${comment.post?.permalink}c/${comment.instagram_id}/`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="btn-link"
                                                >
                                                    Lihat
                                                </a>
                                            ) : (
                                                <span className="date-info" style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '0.5rem',
                                                    color: '#0369a1',
                                                    fontWeight: '500'
                                                }}>
                                                    <span style={{ fontSize: '1.2rem' }}>📥</span> Inbox DM
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <select 
                                                value={comment.category_id || ''} 
                                                onChange={(e) => handleUpdate(comment.id, 'category_id', e.target.value)}
                                                className="form-select-inline"
                                            >
                                                <option value="">Pilih Kategori</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select 
                                                value={comment.status_id} 
                                                onChange={(e) => handleUpdate(comment.id, 'status_id', e.target.value)}
                                                className="form-select-inline"
                                            >
                                                {statuses.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            {/* Placeholder untuk Aksi lain jika diperlukan */}
                                        </td>
                                    </tr>
                                ))}
                                {comments.filter(c => c.type === activeTab).length === 0 && (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="empty-state">
                                                <div className="empty-state-icon">📋</div>
                                                <h3>Belum Ada Data</h3>
                                                <p>Belum ada {activeTab === 'comment' ? 'komentar' : 'pesan DM'} yang masuk saat ini</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}