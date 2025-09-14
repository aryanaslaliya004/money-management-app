import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import IncomeExpenseChart from './IncomeExpenseChart';

function MoneyManagement({ onLogout }) {
  const [entries, setEntries] = useState([]);
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => { fetchEntries(); }, []);
  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setEntries(await response.json());
    } catch (error) { console.error('Error fetching entries:', error); }
  };
  const addEntry = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ type, amount, description }),
      });
      if (response.ok) { setAmount(''); setDescription(''); fetchEntries(); }
    } catch (error) { console.error('Error adding entry:', error); }
  };
  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) fetchEntries();
    } catch (error) { console.error('Error deleting entry:', error); }
  };
  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;
  return (
    <div className="app">
      <header><h1>Money Management</h1><button onClick={onLogout}>Logout</button></header>
      <div className="summary">
        <div className="summary-item"><h2>Total Income</h2><p>₹{totalIncome.toFixed(2)}</p></div>
        <div className="summary-item"><h2>Total Expense</h2><p>₹{totalExpense.toFixed(2)}</p></div>
        <div className="summary-item"><h2>Balance</h2><p>₹{balance.toFixed(2)}</p></div>
      </div>
      <IncomeExpenseChart entries={entries} />
      <form onSubmit={addEntry} className="entry-form">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit">Add Entry</button>
      </form>
      <ul className="entries-list">
        {entries.map(entry => (
          <li key={entry._id} className={`entry ${entry.type}`}>
            <span>{entry.type}</span><span>₹{entry.amount.toFixed(2)}</span><span>{entry.description}</span>
            <button onClick={() => deleteEntry(entry._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => { if (localStorage.getItem('token')) setIsAuthenticated(true); }, []);
  const handleLogin = () => setIsAuthenticated(true);
  const handleRegister = () => setIsAuthenticated(true);
  const handleLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); };
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <MoneyManagement onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register onRegister={handleRegister} />} />
      </Routes>
    </Router>
  );
}

export default App;
