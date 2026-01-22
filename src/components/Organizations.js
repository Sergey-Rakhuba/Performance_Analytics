import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const Organizations = () => {
  const { organizations, addOrganization, removeOrganization } = useData();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    code: '',
    contactName: '',
    position: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddValue = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.code.trim()) {
      const success = addOrganization(formData);
      if (success) {
        setFormData({
            name: '',
            address: '',
            code: '',
            contactName: '',
            position: '',
            phone: ''
        });
        setError('');
      } else {
        setError('Организация с таким именем или кодом уже существует!');
      }
    } else {
        setError('Заполните обязательные поля (Название и Код)!');
    }
  };

  return (
    <div className="admin-panel" style={{ maxWidth: '1920px', margin: '0 auto' }}>
      <h2>Управление организациями</h2>

      <div className="admin-section">
        <h3>Добавить организацию</h3>
        {error && <div className="alert" style={{ color: 'red', borderColor: 'red', background: '#fff0f0' }}>{error}</div>}
        <form onSubmit={handleAddValue} className="admin-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <input 
            type="text" 
            name="name"
            placeholder="Название организации *" 
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input 
            type="text" 
            name="code"
            placeholder="Код организации *" 
            value={formData.code}
            onChange={handleChange}
            required
          />
          <input 
            type="text" 
            name="address"
            placeholder="Адрес" 
            value={formData.address}
            onChange={handleChange}
          />
          <input 
            type="text" 
            name="contactName"
            placeholder="ФИО контакта" 
            value={formData.contactName}
            onChange={handleChange}
          />
          <input 
            type="text" 
            name="position"
            placeholder="Должность" 
            value={formData.position}
            onChange={handleChange}
          />
          <input 
            type="tel" 
            name="phone"
            placeholder="Номер телефона" 
            value={formData.phone}
            onChange={handleChange}
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-success">Добавить</button>
          </div>
        </form>

        <ul className="list-group" style={{ marginTop: '30px' }}>
          {organizations.map((org) => (
            <li key={org.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{org.name} (Код: {org.code})</span>
                {currentUser?.role === 'admin' && (
                  <button onClick={() => removeOrganization(org.id)} className="btn btn-danger btn-sm">Удалить</button>
                )}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
                  <div>📍 Адрес: {org.address || '-'}</div>
                  <div>📞 Тел: {org.phone || '-'}</div>
                  <div>👤 Контакт: {org.contactName || '-'}</div>
                  <div>💼 Должность: {org.position || '-'}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Organizations;
