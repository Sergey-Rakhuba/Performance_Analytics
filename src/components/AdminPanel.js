import React, { useState } from 'react';
import { useData } from '../context/DataContext';

const AdminPanel = () => {
  const { users, criteria, addUser, removeUser, criterion, addCriterion, removeCriterion } = useData();
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newCriteria, setNewCriteria] = useState('');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addUser(newUserName, newUserRole);
      setNewUserName('');
    }
  };

  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (newCriteria.trim()) {
      addCriterion(newCriteria);
      setNewCriteria('');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Панель Администратора</h2>

      <div className="admin-section">
        <h3>Управление пользователями</h3>
        <form onSubmit={handleAddUser} className="admin-form">
          <input 
            type="text" 
            placeholder="Имя пользователя" 
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
            <option value="user">Сотрудник</option>
            <option value="admin">Администратор</option>
          </select>
          <button type="submit" className="btn btn-success">Добавить</button>
        </form>
        
        <ul className="list-group">
          {users.map(user => (
            <li key={user.id} className="list-item">
              <span>{user.name} ({user.role})</span>
              {user.role !== 'admin' && (
                <button onClick={() => removeUser(user.id)} className="btn btn-danger btn-sm">Удалить</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h3>Управление критериями</h3>
        <form onSubmit={handleAddCriteria} className="admin-form">
          <input 
            type="text" 
            placeholder="Название критерия" 
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
          />
          <button type="submit" className="btn btn-success">Добавить</button>
        </form>

        <ul className="list-group">
          {criteria.map((crit, idx) => (
            <li key={idx} className="list-item">
              <span>{crit}</span>
              <button onClick={() => removeCriterion(crit)} className="btn btn-danger btn-sm">Удалить</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
