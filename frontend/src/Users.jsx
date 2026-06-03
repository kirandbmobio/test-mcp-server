import { useState, useEffect } from 'react';

const API = '/api/users';

const emptyForm = { name: '', email: '', role: 'user' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); })
      .catch(() => { setError('Failed to load users.'); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      if (editId) {
        const res = await fetch(`${API}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setUsers(users.map((u) => (u._id === editId ? updated : u)));
        setEditId(null);
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const newUser = await res.json();
        if (!res.ok) { setError(newUser.message); return; }
        setUsers([newUser, ...users]);
      }
      setForm(emptyForm);
    } catch {
      setError('Failed to save user.');
    }
  };

  const startEdit = (user) => {
    setEditId(user._id);
    setForm({ name: user.name, email: user.email, role: user.role });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setUsers(users.filter((u) => u._id !== id));
    } catch {
      setError('Failed to delete user.');
    }
  };

  return (
    <div className="app">
      <h1>User Management</h1>

      {error && (
        <p className="error" onClick={() => setError('')}>{error}</p>
      )}

      <form onSubmit={handleSubmit} className="user-form">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          type="email"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editId ? 'Update' : 'Add User'}</button>
        {editId && (
          <button type="button" className="cancel-btn" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p className="empty">Loading...</p>
      ) : users.length === 0 ? (
        <p className="empty">No users yet. Add one above!</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                <td className="actions">
                  <button className="edit-btn" onClick={() => startEdit(user)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteUser(user._id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="count">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
    </div>
  );
}
