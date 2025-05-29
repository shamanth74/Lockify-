"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function HowItsSafe() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#212121] text-[#BDBDBD]' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-8"
        >
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold mb-8">How Your Data is Protected</h1>

        <div className="space-y-8">
          <section className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-[#303030]' : 'bg-gray-50'}`}>
            <h2 className="text-2xl font-semibold mb-4">End-to-End Encryption</h2>
            <p className="mb-4">
              Your passwords are encrypted using AES-256 encryption, one of the most secure encryption algorithms available.
              The encryption key is derived from your master password using PBKDF2, making it computationally expensive to crack.
            </p>
            <p>
              Even if someone gains access to our database, they cannot read your passwords without your master password.
            </p>
          </section>

          <section className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-[#303030]' : 'bg-gray-50'}`}>
            <h2 className="text-2xl font-semibold mb-4">Master Password Protection</h2>
            <p className="mb-4">
              Your master password is never stored in plain text. It is hashed using bcrypt, a secure hashing algorithm
              that includes salt and multiple iterations to prevent rainbow table attacks.
            </p>
            <p>
              We cannot recover your master password if you forget it, ensuring that only you have access to your data.
            </p>
          </section>

          <section className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-[#303030]' : 'bg-gray-50'}`}>
            <h2 className="text-2xl font-semibold mb-4">Secure Session Management</h2>
            <p className="mb-4">
              Your session is protected using JWT (JSON Web Tokens) with a secure secret key.
              Tokens are stored in HTTP-only cookies to prevent XSS attacks.
            </p>
            <p>
              You can log out at any time to invalidate your session token.
            </p>
          </section>

          <section className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-[#303030]' : 'bg-gray-50'}`}>
            <h2 className="text-2xl font-semibold mb-4">Password Viewing Security</h2>
            <p className="mb-4">
              When you view a password, it is only shown for 40 seconds before being hidden again.
              This prevents unauthorized access if you step away from your computer.
            </p>
            <p>
              You'll also receive an email notification whenever a password is viewed, helping you track any suspicious activity.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 