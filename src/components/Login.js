import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { users } = useData();
  const { login, currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/analytics');
    }
  }, [currentUser, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.id === parseInt(selectedUserId));
    if (user) {
      login(user);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Вход в систему</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Выберите пользователя:</label>
            <select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">-- Список пользователей --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role === 'admin' ? 'Администратор' : 'Сотрудник'})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Войти</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
