import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { teamApi } from '../api/team';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Users, Plus, X, Mail } from 'lucide-react';

const Team = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector((state) => state.dashboard);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchDashboardData());
    loadInvitations();
  }, [dispatch]);

  const loadInvitations = async () => {
    try {
      const response = await teamApi.getInvitations();
      setInvitations(response.data || []);
    } catch (err: any) {
      console.error('Failed to load invitations:', err);
    }
  };

  const teamMembers = data?.teamMembers || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team members</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Card title="Team Members">
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No team members yet</p>
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Team Member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member: any) => (
              <div
                key={member._id}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-center"
              >
                <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-semibold text-2xl">
                  {getInitials(member.name || 'U')}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{member.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{member.email}</p>
                <Badge variant="info" className="mt-3">
                  {(member.role).slice(0, 1).toUpperCase() + (member.role).slice(1) || 'Team Member'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Invitations */}
      {invitations.filter((inv) => inv.status === 'pending').length > 0 && (
        <Card title="Pending Invitations">
          <div className="space-y-3">
            {invitations
              .filter((inv) => inv.status === 'pending')
              .map((invitation: any) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{invitation.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Role: {invitation.role} • Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={invitation.status === 'pending' ? 'info' : 'default'} size="sm">
                      {invitation.status}
                    </Badge>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to cancel this invitation?')) {
                          try {
                            await teamApi.cancelInvitation(invitation._id);
                            await loadInvitations();
                          } catch (err) {
                            console.error('Failed to cancel invitation:', err);
                          }
                        }
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          try {
            await teamApi.inviteMember({ email, role });
            setIsInviteModalOpen(false);
            setEmail('');
            setRole('member');
            await loadInvitations();
            await dispatch(fetchDashboardData());
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
          } finally {
            setLoading(false);
          }
        }} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter email address"
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            options={[
              { value: 'member', label: 'Member' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Admin' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsInviteModalOpen(false);
                setEmail('');
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Team;
