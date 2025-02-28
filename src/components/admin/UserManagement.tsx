
import { toast } from 'sonner';
import { UserManagementProvider } from './UserManagementContext';
import { CreateUserForm } from './CreateUserForm';
import { UserList } from './UserList';
import { UserDialogs } from './UserDialogs';

export function UserManagement() {
  return (
    <UserManagementProvider>
      <div className="space-y-6">
        <CreateUserForm />
        <UserList />
        <UserDialogs />
      </div>
    </UserManagementProvider>
  );
}
