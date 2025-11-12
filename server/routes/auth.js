const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const csvManager = require('../utils/csvManager');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('employee_id').notEmpty().withMessage('Employee ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, employee_id } = req.body;

    // Find user in CSV file
    const user = csvManager.findOne('users.csv', {
      username: username,
      employee_id: employee_id,
      is_active: 'true'
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Support both hashed and demo passwords for testing
    let validPassword = false;
    if (user.password_hash && user.password_hash.startsWith('$2')) {
      // Hashed password - use bcrypt
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Demo credentials for testing (worker123, super123, hosp123, admin123)
      validPassword = password === 'worker123' || password === 'super123' || password === 'hosp123' || password === 'admin123';
    }

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with configurable secret
    const secret = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';
    const token = jwt.sign(
      {
        userId: user.id,
        employeeId: user.employee_id,
        role: user.role
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        contact_number: user.contact_number,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = csvManager.readCSV('users.csv');

    // Remove password hashes from response
    const safeUsers = users.map(user => ({
      id: user.id,
      employee_id: user.employee_id,
      username: user.username,
      name: user.name,
      role: user.role,
      contact_number: user.contact_number,
      email: user.email,
      is_active: user.is_active === 'true',
      created_at: user.created_at
    }));

    res.json(safeUsers);
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user (Admin only)
router.post('/users', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['anganwadi_worker', 'supervisor', 'hospital', 'admin']).withMessage('Valid role is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    
    // Check if employee_id or username already exists
    const existingUser = csvManager.findOne('users.csv', { employee_id: req.body.employeeId });
    const existingUsername = csvManager.findOne('users.csv', { username: req.body.username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }
    
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    
    const userData = {
      id: userId,
      employee_id: req.body.employeeId,
      username: req.body.username,
      password_hash: hashedPassword,
      name: req.body.name,
      role: req.body.role,
      contact_number: req.body.contactNumber || '',
      email: req.body.email || '',
      is_active: 'true',
      created_by: req.body.createdBy || 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const success = csvManager.writeToCSV('users.csv', userData);
    
    if (success) {
      res.status(201).json({ message: 'User created successfully', id: userId });
    } else {
      throw new Error('Failed to write user data to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Convert frontend field names to database field names
    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.isActive !== undefined) {
      updates.is_active = updates.isActive.toString();
      delete updates.isActive;
    }
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 12);
      delete updates.password;
    }
    
    const success = csvManager.updateCSV('users.csv', req.params.id, updates);
    
    if (success) {
      res.json({ message: 'User updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error updating user:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const success = csvManager.updateCSV('users.csv', req.params.id, {
      is_active: 'false',
      updated_at: new Date().toISOString()
    });
    
    if (success) {
      res.json({ message: 'User deactivated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('❌ Error deactivating user:', err.message);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;
