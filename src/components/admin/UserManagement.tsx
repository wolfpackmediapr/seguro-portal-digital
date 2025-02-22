
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  role: string;
}

export function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const { data: users, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      if (error) throw error
      return users
    }
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'create',
          email,
          password,
          role
        }
      });

      if (response.error) throw response.error;

      toast.success('User created successfully');
      setEmail('');
      setPassword('');
      setRole('user');
      refetch();
    } catch (error) {
      toast.error('Error creating user: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Create New User</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit">Create User</Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">User List</h2>
        <div className="border rounded-lg">
          {users?.map((user: User) => (
            <div key={user.id} className="p-4 border-b last:border-b-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
