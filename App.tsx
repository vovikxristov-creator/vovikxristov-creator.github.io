import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, RefreshCw, Plus, LogOut, Filter } from 'lucide-react';
import { Lead, NewLead, Manager, Period, MessageBoxType } from './types';
import { storageService } from './services/storageService';
import { PERIOD_OPTIONS, PERIOD_NAMES, MANAGERS_LIST } from './constants';
import LoginScreen from './components/LoginScreen';
import LoadingSpinner from './components/common/LoadingSpinner';
import MessageBox from './components/common/MessageBox';
import LeadForm from './components/LeadForm';
import StatsCards from './components/StatsCards';
import LeadsTable from './components/LeadsTable';

const App: React.FC = () => {
    const [currentManager, setCurrentManager] = useState<Manager | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [message, setMessage] = useState<{ text: string; type: MessageBoxType } | null>(null);
    const [period, setPeriod] = useState<Period>('month');
    const [managerFilter, setManagerFilter] = useState<Manager | 'all'>('all');

    useEffect(() => {
        const savedManager = sessionStorage.getItem('currentManager');
        if (savedManager && MANAGERS_LIST.includes(savedManager as Manager)) {
            setCurrentManager(savedManager as Manager);
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const data = await storageService.getAllLeads();
        setLeads(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (currentManager) {
            loadData();
        }
    }, [currentManager, loadData]);

    const handleAddLead = async (lead: NewLead) => {
        const isDuplicate = leads.some(l => 
            (lead.email && l.email && l.email.toLowerCase() === lead.email.toLowerCase()) ||
            (lead.phone && l.phone && l.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, ''))
        );

        if (isDuplicate) {
            setMessage({ text: 'Дубликат! Лид с таким email или телефоном уже существует.', type: 'error' });
            return;
        }

        const result = await storageService.addLead(lead);
        // Fix: Explicitly check for the failure case and return to ensure correct type narrowing for the success case.
        if (!result.success) {
            setMessage({ text: result.error, type: 'error' });
            return;
        }

        setLeads(prev => [result.data, ...prev]);
        setShowForm(false);
        setMessage({ text: 'Лид успешно добавлен!', type: 'success' });
    };

    const handleUpdateLead = async (id: string, data: Lead) => {
        const result = await storageService.updateLead(id, data);
        // Fix: Explicitly check for the failure case and return to ensure correct type narrowing for the success case.
        if (!result.success) {
            setMessage({ text: result.error, type: 'error' });
            return;
        }
        
        setLeads(prev => prev.map(l => l.id === id ? result.data : l));
        setMessage({ text: 'Лид обновлен.', type: 'success' });
    };

    const handleDeleteLead = async (id: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот лид?')) return;
        
        const result = await storageService.deleteLead(id);
        // Fix: Explicitly check for the failure case and return to ensure correct type narrowing for the success case.
        if (!result.success) {
            setMessage({ text: result.error, type: 'error' });
            return;
        }
        
        setLeads(prev => prev.filter(l => l.id !== id));
        setMessage({ text: 'Лид удален.', type: 'success' });
    };

    const handleLogout = () => {
        sessionStorage.removeItem('currentManager');
        setCurrentManager(null);
        setLeads([]);
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const now = new Date();
            const createdDate = new Date(lead.createdAt);
            const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
            
            let periodMatch = true;
            if (period === 'week') periodMatch = diffDays <= 7;
            else if (period === 'month') periodMatch = diffDays <= 30;
            else if (period === 'quarter') periodMatch = diffDays <= 90;
            else if (period === 'year') periodMatch = diffDays <= 365;

            const managerMatch = managerFilter === 'all' || lead.manager === managerFilter;
            
            return periodMatch && managerMatch;
        });
    }, [leads, period, managerFilter]);

    const stats = useMemo(() => {
        const wonLeads = filteredLeads.filter(l => l.status === 'Won');
        return {
            newLeads: filteredLeads.length,
            wonValue: wonLeads.reduce((sum, l) => sum + (l.value || 0), 0),
            conversionRate: filteredLeads.length > 0 ? Math.round((wonLeads.length / filteredLeads.length) * 100) : 0,
        };
    }, [filteredLeads]);

    const kpiTotal = useMemo(() => 
        leads.reduce((sum, l) => sum + (Number(l.kpi) || 0), 0), 
        [leads]
    );

    if (!currentManager) {
        return <LoginScreen onLogin={setCurrentManager} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Sales Lead Tracker</h1>
                    <p className="text-gray-600 mt-1 flex items-center">
                        <User className="w-4 h-4 inline mr-1" />
                        {currentManager}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={loadData} className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 flex items-center" disabled={isLoading}>
                        <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Обновить
                    </button>
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 shadow-md flex items-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Добавить лид
                    </button>
                    <button onClick={handleLogout} className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 flex items-center">
                        <LogOut className="w-5 h-5 mr-2" />
                        Выход
                    </button>
                </div>
            </header>

            {message && <MessageBox message={message.text} type={message.type} onClose={() => setMessage(null)} />}
            
            {showForm && <LeadForm onAddLead={handleAddLead} onCancel={() => setShowForm(false)} currentManager={currentManager} />}

            <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex space-x-2 flex-wrap gap-2">
                    {PERIOD_OPTIONS.map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-sm font-medium rounded-lg transition ${ period === p ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300' }`}>
                            {PERIOD_NAMES[p]}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value as Manager | 'all')} className="shadow border rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500 bg-white">
                        <option value="all">Все менеджеры</option>
                        {MANAGERS_LIST.map(m => ( <option key={m} value={m}>{m}</option> ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner text="Загрузка данных..." />
            ) : (
                <>
                    <StatsCards stats={stats} kpiTotal={kpiTotal} />
                    <LeadsTable leads={filteredLeads} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} />
                </>
            )}
        </div>
    );
};

export default App;