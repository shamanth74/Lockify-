

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { List, Search, Plus, User, Menu } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialPasswords = [
  { id: '1', site: 'Google', password: 'securePass123' },
  { id: '2', site: 'Facebook', password: 'fbPass456' },
  { id: '3', site: 'GitHub', password: 'ghPass789' },
];

export default function Dashboard() {
  const [passwords, setPasswords] = useState(initialPasswords);
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(passwords);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPasswords(items);
  };

  const filteredPasswords = passwords.filter((password) =>
    password.site.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#212121] text-[#BDBDBD]">
      {/* Top Navigation Bar */}
      <nav className="p-4 flex justify-between items-center border-b border-[#424242]">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/')}>Home</Button>
          <Button variant="ghost" onClick={() => router.push('/about')}>About Us</Button>
          <Button variant="ghost" onClick={() => router.push('/how-it-works')}>How Lokify Works</Button>
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <DialogHeader>
                <DialogTitle>User Profile</DialogTitle>
                <DialogDescription>
                  Your account details and activity.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <p>Email: user@example.com</p>
                <p>Last Login: 2023-11-20</p>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Menu Box (Left Side) */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: menuOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 h-full w-64 bg-[#303030] p-4 border-r border-[#424242] z-50`}
      >
        <h2 className="text-lg font-semibold mb-4">Lokify Menu</h2>
        <Button variant="ghost" className="w-full justify-start mb-2">My Passwords</Button>
        <Button variant="ghost" className="w-full justify-start mb-2">Settings</Button>
        <Button variant="ghost" className="w-full justify-start mb-2">Logout</Button>
      </motion.div>

      {/* Dashboard Content */}
      <div className="p-8 ml-0 md:ml-64">
        <h1 className="text-3xl font-bold mb-4">Welcome, User!</h1>
        <Button variant="default" className="mb-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Password
        </Button>

        {/* Search Bar */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#3A3A3A] border border-[#424242] rounded-md text-[#BDBDBD]"
          />
        </div>

        {/* Password List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="passwords">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {filteredPasswords.map((password, index) => (
                  <Draggable key={password.id} draggableId={password.id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="p-4 bg-[#3A3A3A] border border-[#424242] rounded-md flex justify-between items-center"
                      >
                        <div>
                          <strong>{password.site}</strong>: {password.password}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon">
                            <List className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}