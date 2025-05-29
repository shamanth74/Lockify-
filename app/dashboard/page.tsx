"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useTheme } from '../providers';
import { FiSun, FiMoon, FiShield, FiLock, FiBell, FiKey, FiPlus, FiSearch, FiEye, FiTrash2, FiMenu, FiLogOut, FiUserX, FiUser, FiX, FiClock } from "react-icons/fi";
import Link from "next/link";

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
  const { theme, toggleTheme } = useTheme();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [newPassword, setNewPassword] = useState({
    site: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewingPassword, setViewingPassword] = useState<{id: string, password: string} | null>(null);
  const [viewPasswordTimeout, setViewPasswordTimeout] = useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchPasswords();
    fetchUserProfile();
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

  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/dashboard/fetch', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch passwords');
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data.passwords)) {
        throw new Error('Invalid response format from server');
      }

      setPasswords(data.passwords);
    } catch (error: any) {
      console.error('Error fetching passwords:', error);
      toast.error(error.message || 'Failed to fetch passwords');
      setPasswords([]);
      
      // If unauthorized, redirect to login
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch passwords on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchPasswords();
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newPassword.site || !newPassword.password || !masterPassword) {
        toast.error('Site, password, and master password are required');
        return;
      }

      // First verify the master password
      const verifyResponse = await fetch('/api/users/verify-master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.message || 'Invalid master password');
      }

      // If master password is verified, proceed with adding the password
      const response = await fetch('/api/dashboard/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          site: newPassword.site,
          username: newPassword.username || '',
          password: newPassword.password,
          masterPassword
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add password');
      }

      toast.success('Password added successfully');
      setShowAddPassword(false);
      setNewPassword({ site: "", username: "", password: "" });
      setMasterPassword("");
      
      // Use the new refresh function
      refreshPasswords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add password');
      setMasterPassword("");
    }
  };

  const handleViewPassword = async (passwordId: string) => {
    try {
      // First verify the master password
      const verifyResponse = await fetch('/api/users/verify-master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.message || 'Invalid master password');
      }

      // If master password is verified, proceed with viewing the password
      const response = await fetch(`/api/dashboard/view/${passwordId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to view password');
      }

      const data = await response.json();
      
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

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        throw new Error(error.message || 'Invalid master password');
      }

      // If master password is verified, proceed with deletion
      const response = await fetch(`/api/dashboard/delete/${passwordId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ masterPassword }), // Send master password for final verification
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete password');
      }
      
      toast.success('Password deleted successfully', {
        duration: 5000,
        closeButton: true,
        position: 'top-right',
        style: { display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
      });
      
      // Reset states
      setShowMasterPassword(false);
      setMasterPassword('');
      setIsDeleting(false);
      
      // Refresh the password list
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

  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Add a function to manually refresh passwords
  const refreshPasswords = () => {
    fetchPasswords();
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation Bar */}
      <nav className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FiShield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">SecurePass</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/how-its-safe" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It's Safe
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-2 rounded-lg hover:bg-accent transition-colors ${
                    showMenu ? 'bg-accent' : ''
                  }`}
                  aria-label="Menu"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                
                {/* Dropdown Menu */}
                {showMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowProfile(true);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-gray-200 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FiUser className="mr-3 h-5 w-5" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleLogout();
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-gray-200 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FiLogOut className="mr-3 h-5 w-5" />
                        Logout
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setSelectedPasswordId('');
                          setIsDeleting(false);
                          setShowMasterPassword(true);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-red-400 hover:bg-gray-700'
                            : 'text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <FiUserX className="mr-3 h-5 w-5" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar and Add Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border-2 ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
          <button
            onClick={() => setShowAddPassword(true)}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'
            }`}
          >
            <FiPlus className="inline-block mr-2" />
            Add Password
          </button>
        </div>
      </div>

      {/* Password List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-8">Loading passwords...</div>
        ) : filteredPasswords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No passwords found matching your search.' : 'No passwords saved yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPasswords.map((password) => (
              <div key={password.id} className="glass-effect rounded-xl p-6 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{password.site}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPasswordId(password.id);
                        setShowMasterPassword(true);
                      }}
                      className={`p-2 rounded-md ${
                        theme === 'dark'
                          ? 'text-blue-400 hover:bg-gray-800'
                          : 'text-blue-600 hover:bg-gray-100'
                      } transition-colors`}
                      title="View Password"
                    >
                      <FiEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPasswordId(password.id);
                        setIsDeleting(true);
                        setShowMasterPassword(true);
                      }}
                      className={`p-2 rounded-md ${
                        theme === 'dark'
                          ? 'text-red-400 hover:bg-gray-800'
                          : 'text-red-600 hover:bg-gray-100'
                      } transition-colors`}
                      title="Delete Password"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {password.username && (
                  <p className="text-muted-foreground mb-2">Username: {password.username}</p>
                )}
                <p className="text-muted-foreground">Password: {renderPassword(password)}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Password Modal */}
      {showAddPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md border-2 shadow-2xl ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-200 shadow-gray-900/20'
          }`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Password</h2>
              <form onSubmit={handleAddPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Master Password</label>
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter your master password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Site Name</label>
                  <input
                    type="text"
                    value={newPassword.site}
                    onChange={(e) => setNewPassword({ ...newPassword, site: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="e.g., Gmail"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username (Optional)</label>
                  <input
                    type="text"
                    value={newPassword.username}
                    onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={newPassword.password}
                    onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(false)}
                    className={`px-4 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-black hover:bg-gray-800'
                    } transition-colors`}
                  >
                    Add Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Master Password Modal */}
      {showMasterPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md border-2 shadow-2xl ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-200 shadow-gray-900/20'
          }`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {isDeleting ? 'Delete Password' : 'View Password'}
              </h2>
              <form onSubmit={handleMasterPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Master Password</label>
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter your master password"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMasterPassword(false);
                      setMasterPassword('');
                      setIsDeleting(false);
                    }}
                    className={`px-4 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${
                      isDeleting
                        ? theme === 'dark'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-red-600 hover:bg-red-700'
                        : theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-black hover:bg-gray-800'
                    } transition-colors`}
                  >
                    {isDeleting ? 'Delete' : 'View'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Master Password Modal for Account Deletion */}
      {showMasterPassword && !selectedPasswordId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md border-2 shadow-2xl ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-200 shadow-gray-900/20'
          }`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
              <p className="text-red-500 mb-4">Warning: This action cannot be undone. All your passwords will be permanently deleted.</p>
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Master Password</label>
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="Enter your master password"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMasterPassword(false);
                      setMasterPassword('');
                    }}
                    className={`px-4 py-2 rounded-md border-2 ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800'
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } transition-colors`}
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md border-2 shadow-2xl ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-700 shadow-gray-900/50' 
              : 'bg-white border-gray-200 shadow-gray-900/20'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Profile</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className={`p-2 rounded-lg hover:bg-accent transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <FiUser className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userProfile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <FiClock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}