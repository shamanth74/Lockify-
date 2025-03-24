import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Derive a key from the master password using PBKDF2
export function generateKey(masterPassword: string, salt: string = crypto.randomBytes(16).toString('hex')) {
  const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha256');
  return { key, salt };
}

// Encrypt the password
export function encryptPassword(password: string, masterPassword: string) {
  const { key, salt } = generateKey(masterPassword);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(password, 'utf-8'), cipher.final()]);
  return {
    encryptedPassword: `${iv.toString('hex')}:${encrypted.toString('hex')}:${salt}`,
  };
}

// Decrypt the password
export function decryptPassword(encryptedPassword: string, masterPassword: string) {
    try{

        const [ivHex, encryptedHex, salt] = encryptedPassword.split(':');
        const { key } = generateKey(masterPassword, salt);
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
      
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString('utf-8');
    }catch(err){
        return null;
    }
}
