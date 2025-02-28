
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
import { AdminUser } from './types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function UserManagement() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  const { data: users, refetch, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data as AdminUser[];
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
    } catch (error: any) {
      toast.error('Error creating user: ' + error.message);
    }
  };

  const handleViewUserDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'delete',
          userId: selectedUser.id
        }
      });

      if (response.error) throw response.error;
      
      toast.success('User deleted successfully');
      setIsConfirmDeleteOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error: any) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const newStatus = user.disabled ? 'active' : 'suspended';
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'updateStatus',
          userId: user.id,
          disabled: !user.disabled
        }
      });

      if (response.error) throw response.error;
      
      toast.success(`User ${newStatus} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(`Error updating user status: ${error.message}`);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGeneratePassword = () => {
    const generated = generateRandomPassword();
    setNewPassword(generated);
    setGeneratedPassword(generated);
  };

  const handleResetUserPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const response = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'resetPassword',
          userId: selectedUser.id,
          password: newPassword
        }
      });

      if (response.error) throw response.error;
      
      toast.success('Password reset successfully');
      setIsPasswordResetOpen(false);
    } catch (error: any) {
      toast.error('Error resetting password: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Add a new user to the system</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Manage existing users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer">
                    <TableCell 
                      className="font-medium"
                      onClick={() => handleViewUserDetails(user)}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell onClick={() => handleViewUserDetails(user)}>
                      {user.role || 'user'}
                    </TableCell>
                    <TableCell onClick={() => handleViewUserDetails(user)}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.disabled ? 'Suspended' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.disabled ? 'Activate' : 'Suspend'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsConfirmDeleteOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">User ID</Label>
                  <p className="font-mono text-xs break-all">{selectedUser.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <p>{selectedUser.disabled ? 'Suspended' : 'Active'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Role</Label>
                  <p>{selectedUser.role || 'user'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Created At</Label>
                  <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Last Sign In</Label>
                  <p>{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'Never'}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUserDetailsOpen(false);
                    setIsPasswordResetOpen(true);
                    setNewPassword('');
                    setGeneratedPassword('');
                  }}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUserDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant={selectedUser.disabled ? 'default' : 'secondary'}
                  onClick={() => {
                    handleToggleUserStatus(selectedUser);
                    setIsUserDetailsOpen(false);
                  }}
                >
                  {selectedUser.disabled ? 'Activate User' : 'Suspend User'}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsUserDetailsOpen(false);
                    setIsConfirmDeleteOpen(true);
                  }}
                >
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="flex space-x-2">
                <Input
                  id="newPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleGeneratePassword}
                >
                  Generate
                </Button>
              </div>
            </div>
            
            {generatedPassword && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                <p className="text-sm font-semibold text-amber-800">Generated Password:</p>
                <p className="font-mono text-amber-900">{generatedPassword}</p>
                <p className="text-xs text-amber-700 mt-2">Be sure to copy this password before closing this dialog.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordResetOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleResetUserPassword}
              disabled={!newPassword}
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user {selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
