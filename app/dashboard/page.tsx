

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';
import { List, Search, Plus, User, Menu, Trash, Eye, EyeOff, LogOut, Sun, Moon, X } from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import DragDropContext with no SSR
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Password {
  id: string;
  _id: string; // MongoDB ID
  site: string;
  password: string;
  username?: string;
}

interface UserProfile {
  email: string;
  lastLogin: string;
}

export default function Dashboard() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [newPassword, setNewPassword] = useState({ site: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewingPassword, setViewingPassword] = useState<{id: string, password: string} | null>(null);
  const [viewPasswordTimeout, setViewPasswordTimeout] = useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchPasswords();
    fetchUserProfile();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (viewingPassword) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setViewingPassword(null);
            setViewPasswordTimeout(null);
            return 40;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [viewingPassword]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUserProfile(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch user profile', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const fetchPasswords = async () => {
    try {
      const response = await fetch('/api/dashboard/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword: '' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPasswords(data.passwords || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch passwords', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
    }
  };

  const handleAddPassword = async () => {
    try {
      if (!newPassword.site || !newPassword.password) {
        toast.error('Site and password are required', {
          duration: 5000,
          closeButton: true,
          position: 'top-right',
          style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
        });
        return;
      }

      const response = await fetch('/api/dashboard/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          site: newPassword.site,
          username: newPassword.username,
          password: newPassword.password,
          masterPassword: masterPassword
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success('Password added successfully', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      setShowAddPassword(false);
      setNewPassword({ site: '', username: '', password: '' });
      setMasterPassword('');
      fetchPasswords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add password', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
    }
  };

  const handleViewPassword = async (passwordId: string) => {
    try {
      const response = await fetch(`/api/dashboard/view/${passwordId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Clear any existing timeout
      if (viewPasswordTimeout) {
        clearTimeout(viewPasswordTimeout);
      }

      // Set the password to view
      setViewingPassword({ id: passwordId, password: data.password });
      setTimeLeft(40);
      
      // Set timeout to clear password after 40 seconds
      const timeout = setTimeout(() => {
        setViewingPassword(null);
        setViewPasswordTimeout(null);
      }, 40000);
      
      setViewPasswordTimeout(timeout);
      toast.success('Password will be visible for 40 seconds', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      setShowMasterPassword(false);
      setMasterPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to view password', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      setMasterPassword('');
    }
  };

  const handleDeletePassword = async (passwordId: string) => {
    try {
      // First verify master password
      const verifyResponse = await fetch('/api/users/verify-master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(verifyData.message);

      // If master password is correct, proceed with deletion
      const response = await fetch(`/api/dashboard/delete/${passwordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      toast.success('Password deleted successfully', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      setShowMasterPassword(false);
      setMasterPassword('');
      fetchPasswords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete password', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      setMasterPassword('');
    }
  };

  const handleMyPasswords = () => {
    fetchPasswords();
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Clear the token from localStorage
      localStorage.removeItem('token');
      
      // Clear the token cookie by making a request to the logout endpoint
      await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      toast.success('Logged out successfully', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      router.push('/login');
    } catch (error) {
      toast.error('Error logging out', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      console.error('Logout error:', error);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(passwords);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPasswords(items);
  };

  const filteredPasswords = passwords.filter((password) =>
    password.site.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update the password list rendering to show password when viewing
  const renderPassword = (password: Password) => {
    if (viewingPassword && viewingPassword.id === password.id) {
      return (
        <div className="flex items-center space-x-2">
          <span>{viewingPassword.password}</span>
          <span className="text-sm text-blue-500">({timeLeft}s)</span>
        </div>
      );
    }
    return '********';
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Clear local storage and cookies
      localStorage.removeItem('token');
      
      // Close the master password dialog
      setShowMasterPassword(false);
      setMasterPassword('');
      
      toast.success('Account deleted successfully', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      
      // Force navigation to login page
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      setMasterPassword('');
    }
  };

  const handleMasterPasswordSubmit = async () => {
    if (!selectedPasswordId) return;
    
    try {
      if (isDeleting) {
        await handleDeletePassword(selectedPasswordId);
      } else {
        await handleViewPassword(selectedPasswordId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Password Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Passwords</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddPassword(true)}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Add Password
          </motion.button>
        </div>

        {passwords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No passwords saved yet. Add your first password!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passwords.map((password) => (
              <motion.div
                key={password.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{password.site}</h3>
                    {password.username && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">Username: {password.username}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPasswordId(password.id);
                        setShowMasterPassword(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    >
                      👁️
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPasswordId(password.id);
                        setIsDeleting(true);
                        setShowMasterPassword(true);
                      }}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>
                {viewingPassword?.id === password.id && (
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      Password: {viewingPassword?.password}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Visible for {timeLeft} seconds
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {showAddPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddPassword(); }} className="space-y-4">
              <div>
                <label htmlFor="site" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site
                </label>
                <input
                  type="text"
                  id="site"
                  value={newPassword.site}
                  onChange={(e) => setNewPassword({ ...newPassword, site: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter site name"
                  required
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username (optional)
                </label>
                <input
                  type="text"
                  id="username"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowAddPassword(false)}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Password
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showMasterPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enter Master Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleMasterPasswordSubmit(); }} className="space-y-4">
              <div>
                <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  id="masterPassword"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your master password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowMasterPassword(false);
                    setMasterPassword('');
                  }}
                  className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Submit
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Account</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                Delete Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}