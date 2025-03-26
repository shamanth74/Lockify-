"use client"; // Important for Next.js App Router and client-side interactivity

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const x = useMotionValue(0);
  const background = useTransform(x, [-20, 0, 20], ["#6B46C1", "#8B5CF6", "#6B46C1"]);
  const buttonRef = useRef(null);

  const handleSubmit = async (e: any) => { // added e:any
    e.preventDefault();
    setIsLoading(true);


    try {
      console.log({ email, password });
      router.push('/dashboard');
    } catch (err: any) { // added err:any
      setError('Signup failed. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 to-purple-300"
    >
      <Card className="w-full max-w-md p-8 shadow-2xl backdrop-blur-xl bg-white/20 border border-purple-200 rounded-sm">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardTitle className="text-4xl font-extrabold text-center text-purple-700 tracking-wide">
              Welcome Back! Login to Lokify
            </CardTitle>
            <CardDescription className="text-center text-gray-500 mt-2">
              Secure your digital world with Lokify.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full mt-1 bg-white/80 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full mt-1 bg-white/80 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
         
           
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <motion.div
              ref={buttonRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ background }}
              onMouseMove={(e) => {
                if (buttonRef.current) {
                    const rect = (buttonRef.current as HTMLElement).getBoundingClientRect();
                  x.set(e.clientX - rect.left - rect.width / 2);
                }
              }}
            >
              <Button
                type="submit"
                className="w-full text-white font-semibold rounded-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" />
                    Getting You In ...
                  </div>
                ) : (
                  "Login To Lokify"
                )}
              </Button>
            </motion.div>
            Dont have an account?<Link href={'/signup'}> Click Here to SignUp</Link>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}