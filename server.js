const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Supabase Connection
const supabaseUrl = 'https://styyowwhpmizpktkoptw.supabase.co';
const supabaseKey = 'sb_publishable_XCllAJL_RAxakFUrLrpOcA_0rOvUnqd';
const supabase = createClient(supabaseUrl, supabaseKey);

// Auth Middleware
app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api/')) return next();
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    // Create a request-specific Supabase client with the user's token
    req.supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });

    req.user = user;
    next();
});

// API Routes

// 1. Get all tasks
app.get('/api/tasks', async (req, res) => {
    const { data, error } = await req.supabase
        .from('tasks')
        .select('*')
        .eq('user_id', req.user.id)
        .order('id', { ascending: false });
        
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json({ tasks: data });
});

// 2. Add a new task
app.post('/api/tasks', async (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'Task content is required' });
    }
    
    const { data, error } = await req.supabase
        .from('tasks')
        .insert([{ task, status: 'pending', user_id: req.user.id }])
        .select();
        
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    
    // Return the inserted row
    res.status(201).json(data[0]);
});

// 3. Mark a task as completed or pending
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'pending' or 'completed'
    
    if (status !== 'pending' && status !== 'completed') {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await req.supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated successfully', id, status });
});

// 4. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await req.supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
