require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const entrySchema = new mongoose.Schema({
  type: String,
  amount: Number,
  description: String,
});

const User = mongoose.model('User', userSchema);
const Entry = mongoose.model('Entry', entrySchema);

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ token: username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/entries', async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/entries', async (req, res) => {
  const { type, amount, description } = req.body;
  if (!type || !amount || !description) return res.status(400).json({ error: 'Type, amount, and description are required' });
  try {
    const entry = new Entry({ type, amount: parseFloat(amount), description });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const entry = await Entry.findByIdAndDelete(id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
