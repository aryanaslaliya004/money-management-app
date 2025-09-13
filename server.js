const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 5000;
app.use(cors());
app.use(bodyParser.json());
let entries = [];
let nextId = 1;
let users = [];
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  const existingUser = users.find(user => user.username === username);
  if (existingUser) return res.status(400).json({ error: 'Username already exists' });
  users.push({ username, password });
  res.status(201).json({ token: username });
});
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: username });
});
app.get('/api/entries', (req, res) => res.json(entries));
app.post('/api/entries', (req, res) => {
  const { type, amount, description } = req.body;
  if (!type || !amount || !description) return res.status(400).json({ error: 'Type, amount, and description are required' });
  entries.push({ id: nextId++, type, amount: parseFloat(amount), description });
  res.status(201).json(entries[entries.length - 1]);
});
app.delete('/api/entries/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = entries.findIndex(entry => entry.id === id);
  if (index === -1) return res.status(404).json({ error: 'Entry not found' });
  entries.splice(index, 1);
  res.status(204).send();
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
