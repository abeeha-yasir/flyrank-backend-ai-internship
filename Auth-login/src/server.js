require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = Number(process.env.PORT || 3000);
const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
const supabase = hasSupabaseConfig
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;

app.use(express.json());

function authUnavailable(res) {
  return res.status(503).json({ error: 'Supabase is not configured' });
}

async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const tokenMatch = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!tokenMatch) return res.status(401).json({ error: 'Access token required' });
  if (!supabase) return authUnavailable(res);

  try {
    const { data, error } = await supabase.auth.getUser(tokenMatch[1]);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = data.user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!supabase) return authUnavailable(res);

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ user: data.user });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!supabase) return authUnavailable(res);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return res.status(401).json({ error: 'Invalid login credentials' });
  return res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

app.get('/public/info', (req, res) => {
  res.json({ message: 'Welcome stranger! This info is public.' });
});

app.get('/protected/profile', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at,
  });
});

app.get('/protected/dashboard', requireAuth, (req, res) => {
  res.json({ message: 'Welcome to your dashboard.' });
});

app.post('/auth/logout', requireAuth, async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(401).json({ error: error.message });
  return res.status(204).send();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { app };