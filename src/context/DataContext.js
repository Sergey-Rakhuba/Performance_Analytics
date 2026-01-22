import React, { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Инициализация пользователей
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('pa_users');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Галя', role: 'user' },
      { id: 2, name: 'Петя', role: 'user' },
      { id: 3, name: 'Валя', role: 'user' },
      { id: 4, name: 'Толя', role: 'user' },
      { id: 99, name: 'Администратор', role: 'admin' }
    ];
  });

  // Инициализация критериев
  const [criteria, setCriteria] = useState(() => {
    const saved = localStorage.getItem('pa_criteria');
    return saved ? JSON.parse(saved) : [
      'Намерение',
      'Презентация',
      'Работа с клиентом',
      'Закрытые продажи',
      'Сопровождение',
      'Отказ'
    ];
  });

  // Инициализация организаций
  const [organizations, setOrganizations] = useState(() => {
    const saved = localStorage.getItem('pa_organizations');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      // Миграция старых данных (если это массив строк)
      if (parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed.map((name, idx) => ({
          id: Date.now() + idx,
          name,
          address: '',
          code: '',
          contactName: '',
          position: '',
          phone: ''
        }));
      }
      return parsed.length ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Инициализация записей (логов)
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('pa_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Сохранение в LocalStorage при изменениях
  useEffect(() => {
    localStorage.setItem('pa_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('pa_criteria', JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem('pa_organizations', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('pa_logs', JSON.stringify(logs));
  }, [logs]);

  // Методы управления данными
  const addUser = (name, role = 'user') => {
    const newUser = { id: Date.now(), name, role };
    setUsers([...users, newUser]);
  };

  const removeUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const addCriterion = (name) => {
    if (!criteria.includes(name)) {
      setCriteria([...criteria, name]);
    }
  };

  const removeCriterion = (name) => {
    setCriteria(criteria.filter(c => c !== name));
  };

  const addOrganization = (orgData) => {
    // Проверка на дубли по Коду организации или Имени
    const isDuplicate = organizations.some(
      org => org.code === orgData.code || org.name.toLowerCase() === orgData.name.toLowerCase()
    );

    if (!isDuplicate) {
      setOrganizations([...organizations, { ...orgData, id: Date.now() }]);
      return true; // Успешно добавлено
    }
    return false; // Дубликат
  };

  const removeOrganization = (id) => {
    setOrganizations(organizations.filter(o => o.id !== id));
  };

  const addLog = (userName, criterion, comment, organization, selectedDate) => {
    const newLog = {
      id: Date.now(),
      date: selectedDate ? new Date(selectedDate).toISOString() : new Date().toISOString(), // Дата для аналитики
      createdAt: new Date().toISOString(), // Дата ввода
      user: userName,
      criterion,
      comment,
      organization // Организация
    };
    setLogs([...logs, newLog]);
  };

  return (
    <DataContext.Provider value={{
      users,
      criteria,
      organizations,
      logs,
      addUser,
      removeUser,
      addCriterion,
      removeCriterion,
      addOrganization,
      removeOrganization,
      addLog
    }}>
      {children}
    </DataContext.Provider>
  );
};
