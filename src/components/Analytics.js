import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart 
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#009900', '#0088FE', '#FF0000'];

const Analytics = () => {
  const { logs, users, criteria } = useData();
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  
  const [selectedUser, setSelectedUser] = useState(currentUser?.role !== 'admin' ? currentUser?.name : '');
  
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      setSelectedUser(currentUser.name);
    }
  }, [currentUser]);

  const [selectedCriterion, setSelectedCriterion] = useState('all');
  const [viewMode, setViewMode] = useState('personal'); // personal, general, combined
  const [showGeneralMetric, setShowGeneralMetric] = useState(true);
  const [showProductivityMetric, setShowProductivityMetric] = useState(true);
  const [isListView, setIsListView] = useState(false);

  // Фильтрация логов по дате
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });
  }, [logs, startDate, endDate]);

  // Данные для ПЕРСОНАЛЬНОГО графика (X - время, Y - кол-во записей по критериям)
  const personalData = useMemo(() => {
    if (!selectedUser) return [];
    
    const userLogs = filteredLogs.filter(log => log.user === selectedUser);
    
    // Группировка по дням
    const grouped = {};
    userLogs.forEach(log => {
      const day = format(new Date(log.date), 'dd.MM.yyyy');
      if (!grouped[day]) {
        grouped[day] = { date: day, total: 0 };
        criteria.forEach(c => grouped[day][c] = 0);
      }
      grouped[day][log.criterion] = (grouped[day][log.criterion] || 0) + 1;
      grouped[day].total += 1;
    });

    // Формирование полного списка дней в диапазоне
    const result = [];
    if (startDate && endDate) {
        let curr = new Date(startDate);
        const end = new Date(endDate);
        
        // Сброс времени для корректной итерации
        curr.setHours(0,0,0,0);
        end.setHours(23,59,59,999);

        while (curr <= end) {
            const dateStr = format(curr, 'dd.MM.yyyy');
            if (grouped[dateStr]) {
                result.push(grouped[dateStr]);
            } else {
                const emptyDay = { date: dateStr, total: 0 };
                criteria.forEach(c => emptyDay[c] = 0);
                result.push(emptyDay);
            }
            curr.setDate(curr.getDate() + 1);
        }
    }
    
    return result;
  }, [filteredLogs, selectedUser, criteria, startDate, endDate]);

  // Данные для ОБЩЕГО графика (X - имя, Y - общее кол-во)
  const generalData = useMemo(() => {
    const grouped = {};
    users.filter(u => u.role !== 'admin').forEach(u => grouped[u.name] = { name: u.name, count: 0 });

    filteredLogs.forEach(log => {
      if (grouped[log.user]) {
        grouped[log.user].count += 1;
      }
    });

    return Object.values(grouped);
  }, [filteredLogs, users]);

  // Данные для СОВМЕЩЕННОГО графика (X - имя, Y - показатели по критериям)
  const combinedData = useMemo(() => {
    const grouped = {};
    users.filter(u => u.role !== 'admin').forEach(u => {
      grouped[u.name] = { name: u.name };
      criteria.forEach(c => grouped[u.name][c] = 0);
    });

    filteredLogs.forEach(log => {
      if (grouped[log.user]) {
        grouped[log.user][log.criterion] = (grouped[log.user][log.criterion] || 0) + 1;
      }
    });

    return Object.values(grouped);
  }, [filteredLogs, users, criteria]);

  return (
    <div className="analytics-page">
      <h2>Аналитика производительности</h2>
      
      <div className="controls-panel">
        <div className="control-group">
          <label>Период:</label>
          <div className="date-inputs">
            <DatePicker selected={startDate} onChange={setStartDate} dateFormat="dd.MM.yyyy" />
            <span> - </span>
            <DatePicker selected={endDate} onChange={setEndDate} dateFormat="dd.MM.yyyy" />
          </div>
        </div>

        <div className="control-group">
          <label>Тип графика:</label>
          <div className="btn-group">
            <button 
              className={`btn ${viewMode === 'personal' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('personal')}
            >
              Персональный
            </button>
            <button 
              className={`btn ${viewMode === 'general' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('general')}
            >
              Общий
            </button>
            {currentUser?.role === 'admin' && (
              <button 
                className={`btn ${viewMode === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('combined')}
              >
                Совмещенный
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        {viewMode === 'personal' && (
          <div className="chart-section">
            <div className="mb-3" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
               {currentUser?.role === 'admin' && (
                 <div>
                    <label>Выберите сотрудника: </label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                      <option value="">-- Не выбрано --</option>
                      {users.filter(u => u.role !== 'admin').map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                 </div>
               )}
               <div>
                  <label>Показатель: </label>
                  <select value={selectedCriterion} onChange={(e) => setSelectedCriterion(e.target.value)}>
                    <option value="all">Все показатели</option>
                    {criteria.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
               </div>
               
               {currentUser?.role === 'admin' && (
                   <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', marginLeft: '20px' }}>
                        <input 
                            type="checkbox" 
                            checked={isListView} 
                            onChange={(e) => setIsListView(e.target.checked)} 
                        />
                        Отобразить списком
                   </label>
               )}
            </div>
            
            {selectedUser && (isListView ? (
                /* Режим Списка */
                <div className="logs-list">
                    {(() => {
                        // Фильтрация для списка
                        const listLogs = filteredLogs.filter(log => 
                             log.user === selectedUser && 
                             (selectedCriterion === 'all' || log.criterion === selectedCriterion)
                        );
                        
                        if (listLogs.length === 0) return <p className="no-data">Нет записей за выбранный период</p>;

                        // Группировка по дате
                        const groupedByDate = {};
                        listLogs.forEach(log => {
                            const dateKey = format(new Date(log.date), 'dd.MM.yyyy');
                            if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
                            groupedByDate[dateKey].push(log);
                        });
                        
                        // Сортировка дат
                        const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
                            new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-'))
                        );

                        return sortedDates.map(date => (
                            <details key={date} style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                <summary style={{ padding: '15px', background: '#f8f9fa', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {date} (Записей: {groupedByDate[date].length})
                                </summary>
                                <div style={{ padding: '15px', background: 'white' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f1f1f1', textAlign: 'left' }}>
                                                <th style={{ padding: '8px' }}>Время</th>
                                                <th style={{ padding: '8px' }}>Действие</th>
                                                <th style={{ padding: '8px' }}>Организация</th>
                                                <th style={{ padding: '8px' }}>Комментарий</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedByDate[date].map(log => {
                                                let timeStr = '-';
                                                try {
                                                    const dateSource = log.createdAt || log.date; // Fallback to log.date if createdAt is missing
                                                    if (dateSource) {
                                                        timeStr = format(new Date(dateSource), 'HH:mm');
                                                    }
                                                } catch (e) {
                                                    console.error("Date parse error", e);
                                                }

                                                return (
                                                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px' }}>{timeStr}</td>
                                                    <td style={{ padding: '8px' }}>{log.criterion}</td>
                                                    <td style={{ padding: '8px' }}>{
                                                        typeof log.organization === 'object' ? log.organization.name : (log.organization || '-')
                                                    }</td>
                                                    <td style={{ padding: '8px' }}>{log.comment || '-'}</td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        ));
                    })()}
                </div>
            ) : (
             /* Режим Графика */
             personalData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                    <div style={{ height: 400, width: '100%', minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <ComposedChart data={personalData} barGap={4} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} label={{ value: 'Записи', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip formatter={(value) => Math.floor(value)} />
                                <Legend />
                                {(selectedCriterion === 'all' ? criteria : [selectedCriterion]).map((c) => {
                                    const idx = criteria.indexOf(c);
                                    return <Bar key={c} dataKey={c} fill={COLORS[idx % COLORS.length]} />;
                                })}
                                {showGeneralMetric && (
                                    <Line 
                                        type="monotone" 
                                        dataKey={(row) => (row[selectedCriterion === 'all' ? 'total' : selectedCriterion] || 0) + 0.15}
                                        stroke={selectedCriterion === 'all' ? '#8884d8' : COLORS[criteria.indexOf(selectedCriterion) % COLORS.length]} 
                                        strokeWidth={3} 
                                        name="Общий показатель" 
                                        dot={false} 
                                    />
                                )}
                                {showProductivityMetric && (
                                    <Line 
                                        type="linear" 
                                        dataKey={selectedCriterion === 'all' ? 'total' : selectedCriterion} 
                                        stroke={selectedCriterion === 'all' ? '#8884d8' : COLORS[criteria.indexOf(selectedCriterion) % COLORS.length]} 
                                        strokeWidth={2} 
                                        strokeDasharray="5 5" 
                                        name="Производительность" 
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="chart-controls" style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                checked={showGeneralMetric} 
                                onChange={(e) => setShowGeneralMetric(e.target.checked)} 
                            />
                            Общий показатель (плавная)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            <input 
                                type="checkbox" 
                                checked={showProductivityMetric} 
                                onChange={(e) => setShowProductivityMetric(e.target.checked)} 
                            />
                            Производительность (ломаная)
                        </label>
                    </div>
                </div>
            ) : <p className="no-data">Нет данных или сотрудник не выбран</p>))}
          </div>
        )}

        {viewMode === 'general' && (
          <div className="chart-section">
             <h4>Общее количество записей за период</h4>
             <div style={{ width: '100%', height: 400, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={generalData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Всего записей" fill="#8884d8" barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}

        {viewMode === 'combined' && (
          <div className="chart-section">
             <h4>Детализация по критериям (Все сотрудники)</h4>
             <div style={{ width: '100%', height: 400, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={combinedData} barGap={4} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {criteria.map((c, idx) => (
                        <Bar key={c} dataKey={c} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
