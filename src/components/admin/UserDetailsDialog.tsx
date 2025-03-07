
import { AdminUser } from './types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserDetailsDialogProps {
  user: AdminUser | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleStatus: (user: AdminUser) => Promise<void>;
  onDelete: () => void;
}

export function UserDetailsDialog({
  user,
  isOpen,
  onOpenChange,
  onToggleStatus,
  onDelete
}: UserDetailsDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information for {user.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">User ID</Label>
              <p className="font-mono text-xs break-all">{user.id}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <p>{user.disabled ? 'Suspended' : 'Active'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p>{user.email}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Role</Label>
              <p>{user.role || 'user'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Created At</Label>
              <p>{new Date(user.created_at).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Last Sign In</Label>
              <p>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button 
              variant={user.disabled ? 'default' : 'secondary'}
              onClick={() => {
                onToggleStatus(user);
                onOpenChange(false);
              }}
            >
              {user.disabled ? 'Activate User' : 'Suspend User'}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                onDelete();
              }}
            >
              Delete User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
