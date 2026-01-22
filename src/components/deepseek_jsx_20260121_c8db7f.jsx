// components/PersonalChart.js - Персональный график
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const PersonalChart = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState(localStorage.getItem('currentUser') || '');
  const [chartData, setChartData] = useState([]);

  const users = JSON.parse(localStorage.getItem('users') || '["Галя", "Петя", "Валя", "Толя"]');
  const criteria = JSON.parse(localStorage.getItem('criteria') || '[]');
  const performanceData = JSON.parse(localStorage.getItem('performanceData') || '[]');

  useEffect(() => {
    updateChartData();
  }, [startDate, endDate, selectedUser]);

  const updateChartData = () => {
    if (!selectedUser) return;

    const filteredData = performanceData.filter(record => {
      const recordDate = new Date(record.date);
      return record.user === selectedUser && 
             recordDate >= startDate && 
             recordDate <= endDate;
    });

    // Группируем по дате и критериям
    const groupedByDate = {};
    filteredData.forEach(record => {
      if (!groupedByDate[record.date]) {
        groupedByDate[record.date] = {
          date: record.date,
          entries: 0
        };
        criteria.forEach(criterion => {
          groupedByDate[record.date][criterion] = 0;
        });
      }
      groupedByDate[record.date][record.criteria] += record.value;
      groupedByDate[record.date].entries += 1;
    });

    // Конвертируем в массив и сортируем по дате
    const result = Object.values(groupedByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item, index) => ({
        ...item,
        recordNumber: index + 1
      }));

    setChartData(result);
  };

  return (
    <div className="personal-chart">
      <h2>Персональный график производительности</h2>
      
      <div className="controls">
        <div className="control-group">
          <label>Сотрудник:</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Выберите сотрудника</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Период с:</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            dateFormat="dd.MM.yyyy"
          />
        </div>

        <div className="control-group">
          <label>по:</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            dateFormat="dd.MM.yyyy"
            minDate={startDate}
          />
        </div>
      </div>

      {selectedUser ? (
        <>
          <div className="chart-container">
            <h3>График производительности: {selectedUser}</h3>
            <p>X - Количество записей, Y - Время (дата)</p>
            
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="recordNumber" 
                  label={{ value: 'Количество записей', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="date"
                  type="category"
                  label={{ value: 'Дата', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => `Запись №${value}`}
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
                {criteria.map((criterion, index) => (
                  <Line
                    key={criterion}
                    type="monotone"
                    dataKey={criterion}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="stats-summary">
            <h3>Статистика за период</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{chartData.length}</div>
                <div className="stat-label">Всего записей</div>
              </div>
              {criteria.map(criterion => {
                const total = chartData.reduce((sum, item) => sum + (item[criterion] || 0), 0);
                return (
                  <div key={criterion} className="stat-card">
                    <div className="stat-value">{total}</div>
                    <div className="stat-label">{criterion}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="no-selection">
          <p>Выберите сотрудника для отображения графика</p>
        </div>
      )}
    </div>
  );
};

export default PersonalChart;