import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const UserEntry = () => {
  const { criteria, organizations, addLog } = useData();
  const { currentUser } = useAuth();
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCriteria || !selectedOrganization) {
        alert("Пожалуйста, заполните все обязательные поля");
        return;
    }

    addLog(currentUser.name, selectedCriteria, comment, selectedOrganization, selectedDate);
    
    setMessage('Данные успешно сохранены!');
    setComment('');
    // Не сбрасываем организацию и дату для удобства ввода следующей записи
    // setSelectedOrganization(''); 
    // setSelectedDate(new Date());
    
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="user-entry">
      <h2>Ввод данных производительности</h2>
      <p>Сотрудник: <strong>{currentUser.name}</strong></p>

      {message && <div className="alert success">{message}</div>}

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label>Дата:</label>
          <DatePicker 
            selected={selectedDate} 
            onChange={date => setSelectedDate(date)} 
            dateFormat="dd.MM.yyyy"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Организация:</label>
          <select 
            value={selectedOrganization} 
            onChange={(e) => setSelectedOrganization(e.target.value)}
            required
          >
            <option value="">-- Выберите организацию --</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>
                {org.name} {org.code ? `(Код: ${org.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Критерий:</label>
          <select 
            value={selectedCriteria} 
            onChange={(e) => setSelectedCriteria(e.target.value)}
            required
          >
            <option value="">-- Выберите критерий --</option>
            {criteria.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Комментарий (опционально):</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            placeholder="Введите пояснение..."
          />
        </div>

        <button type="submit" className="btn btn-primary">Сохранить запись</button>
      </form>
    </div>
  );
};

export default UserEntry;
