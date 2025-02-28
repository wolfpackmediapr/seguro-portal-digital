
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUserManagement } from './UserManagementContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export function UserDialogs() {
  const {
    selectedUser,
    setSelectedUser,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    isUserDetailsOpen,
    setIsUserDetailsOpen,
    isPasswordResetOpen,
    setIsPasswordResetOpen,
    newPassword,
    setNewPassword,
    generatedPassword,
    setGeneratedPassword,
    handleDeleteUser,
    handleToggleUserStatus,
    generateRandomPassword,
  } = useUserManagement();

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
    <>
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
    </>
  );
}
