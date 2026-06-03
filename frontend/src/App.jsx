import { useState, useEffect } from 'react';
import Users from './Users';

const API = '/api/todos';

export default function App() {
  const [tab, setTab] = useState('todos');
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load todos. Is the backend running?');
        setLoading(false);
      });
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      setText('');
    } catch {
      setError('Failed to add todo.');
    }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'PUT' });
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
    } catch {
      setError('Failed to update todo.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setTodos(todos.filter((t) => t._id !== id));
    } catch {
      setError('Failed to delete todo.');
    }
  };

  const remaining = todos.filter((t) => !t.completed).length;

  if (tab === 'users') {
    return (
      <>
        <nav className="nav-tabs">
          <button onClick={() => setTab('todos')}>Todos</button>
          <button className="active">Users</button>
        </nav>
        <Users />
      </>
    );
  }

  return (
    <>
    <nav className="nav-tabs">
      <button className="active">Todos</button>
      <button onClick={() => setTab('users')}>Users</button>
    </nav>
    <div className="app">
      <h1>Todo List</h1>

      {error && (
        <p className="error" onClick={() => setError('')}>
          {error}
        </p>
      )}

      <form onSubmit={addTodo} className="add-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p className="empty">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="empty">No todos yet. Add one above!</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className={`todo-item${todo.completed ? ' completed' : ''}`}
            >
              <span onClick={() => toggleTodo(todo._id)} className="todo-text">
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo._id)}
                className="delete-btn"
                aria-label="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="count">{remaining} item{remaining !== 1 ? 's' : ''} remaining</p>
    </div>
    </>
  );
}
