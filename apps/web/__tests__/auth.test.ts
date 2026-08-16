import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const DEMO_USERS: Record<string, { name: string; hash: string }> = {
  'demo@multazim.sa': { name: 'Demo User', hash: hashPassword('Demo123!') },
};

function validateLogin(email: string, password: string) {
  if (!email || !password) return { error: 'Email and password required', status: 400 };
  const user = DEMO_USERS[email.toLowerCase()];
  if (!user || user.hash !== hashPassword(password)) return { error: 'Invalid credentials', status: 401 };
  return { user: { name: user.name, email } };
}

describe('Auth - Login', () => {
  test('rejects empty email', () => {
    const result = validateLogin('', 'Demo123!');
    expect(result).toHaveProperty('error');
    expect(result.status).toBe(400);
  });

  test('rejects empty password', () => {
    const result = validateLogin('demo@multazim.sa', '');
    expect(result).toHaveProperty('error');
    expect(result.status).toBe(400);
  });

  test('rejects wrong password', () => {
    const result = validateLogin('demo@multazim.sa', 'wrong');
    expect(result).toHaveProperty('error');
    expect(result.status).toBe(401);
  });

  test('rejects unknown email', () => {
    const result = validateLogin('nobody@example.com', 'Demo123!');
    expect(result).toHaveProperty('error');
    expect(result.status).toBe(401);
  });

  test('accepts valid demo credentials', () => {
    const result = validateLogin('demo@multazim.sa', 'Demo123!');
    expect(result).toHaveProperty('user');
    expect((result as any).user.name).toBe('Demo User');
  });

  test('email is case-insensitive', () => {
    const result = validateLogin('DEMO@MULTAZIM.SA', 'Demo123!');
    expect(result).toHaveProperty('user');
  });
});

describe('Auth - Password Hashing', () => {
  test('produces consistent SHA-256 hash', () => {
    const hash1 = hashPassword('test');
    const hash2 = hashPassword('test');
    expect(hash1).toBe(hash2);
  });

  test('produces different hashes for different passwords', () => {
    expect(hashPassword('abc')).not.toBe(hashPassword('xyz'));
  });

  test('hash is 64-char hex string', () => {
    const hash = hashPassword('test');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
