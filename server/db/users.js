// User database with bcrypt hashed passwords
const bcrypt = require('bcryptjs');

// Email domain validation - must be @enatsolution.com
const validateEmailDomain = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  return domain === 'enatsolution.com';
};

// Password validation: min 8 chars, at least 1 uppercase, 1 number, 1 special char
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    valid: minLength && hasUppercase && hasNumber && hasSpecialChar,
    errors: {
      minLength: !minLength ? 'Password must be at least 8 characters' : null,
      hasUppercase: !hasUppercase ? 'Password must contain at least one uppercase letter' : null,
      hasNumber: !hasNumber ? 'Password must contain at least one number' : null,
      hasSpecialChar: !hasSpecialChar ? 'Password must contain at least one special character' : null
    }
  };
};

// Pre-hashed passwords (generated with bcrypt.hashSync(password, 10))
const users = [
  {
    id: 1,
    email: 'endale.gebremariam@enatsolution.com',
    // Password: Endale@enat86
    passwordHash: '$2b$10$mFATC3oAe8w3YeOafvKygOgdo7BMa0gjlIOlKohNLErCRQtAf6IYG',
    name: 'Endale Gebremariam',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    email: 'tsedey.yayeh@enatsolution.com',
    // Password: Tsedey@enat01
    passwordHash: '$2b$10$KrxIz9KFOOMYrkTbwKBd..jzW9gNf05GClPeWAk4Hq.yFDfp3G/gC',
    name: 'Tsedey Yayeh',
    role: 'user',
    createdAt: new Date('2024-12-04')
  },
  {
    id: 3,
    email: 'bezawit.megersa@enatsolution.com',
    // Password: Beza@enat03
    passwordHash: '$2b$10$NfgyH4qnUqGbE7nAHXjl5.V8xvxZpjbMJSc/4.iqqLwHhjYfdnQ8m',
    name: 'Bezawit Megersa',
    role: 'user',
    createdAt: new Date('2024-12-04')
  },
  {
    id: 4,
    email: 'trsit.solomon@enatsolution.com',
    // Password: Trsit@enat00
    passwordHash: '$2b$10$01hl.gyIRRdlu4UeAnEIYOc.fMfX1r24WrO71uCLXwNp0GFOq06SC',
    name: 'Trsit Solomon',
    role: 'user',
    createdAt: new Date('2024-12-04')
  },
  {
    id: 5,
    email: 'daniel.gessese@enatsolution.com',
    // Password: Dani@enat01
    passwordHash: '$2b$10$YlI4HsXD1MGBSdvewL0OX.fbUc0pv5rm9KCZgAKgo7aeEj8jeMoie',
    name: 'Daniel Gessese',
    role: 'user',
    createdAt: new Date('2024-12-04')
  }
];

// Find user by email
const findUserByEmail = (email) => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Verify password against hash
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Hash a new password (for adding users)
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Add a new user (for future use)
const addUser = async (email, password, name, role = 'user') => {
  // Validate email domain
  if (!validateEmailDomain(email)) {
    throw new Error('Email must be from @enatsolution.com domain');
  }

  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors).filter(Boolean).join(', '));
  }

  if (findUserByEmail(email)) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: users.length + 1,
    email,
    passwordHash,
    name,
    role,
    createdAt: new Date()
  };

  users.push(newUser);
  return { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };
};

module.exports = {
  findUserByEmail,
  verifyPassword,
  hashPassword,
  addUser,
  validatePassword,
  validateEmailDomain
};
