import { useEffect, useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchProjects } from '../store/slices/projectSlice';
import { teamApi } from '../api/team';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Users, Plus, X, Mail, FolderOpen, Search } from 'lucide-react';

const Team = () => {
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector((state) => state.project);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'member' | 'viewer'>('member');
  const [inviteProjectId, setInviteProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  // Team page filters
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProjects());
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

  // Build a de-duplicated member list from all projects
  const allMembers = useMemo(() => {
    const memberMap = new Map<string, any>();
    projects.forEach((project) => {
      // Add the project creator
      if (project.createdBy && typeof project.createdBy === 'object') {
        const creator = project.createdBy as any;
        if (!memberMap.has(creator._id)) {
          memberMap.set(creator._id, {
            ...creator,
            projects: [{ _id: project._id, name: project.name, color: project.color }],
          });
        } else {
          memberMap.get(creator._id)!.projects.push({ _id: project._id, name: project.name, color: project.color });
        }
      }
      // Add team members
      (project.teamMembers as any[]).forEach((member: any) => {
        if (!member || typeof member !== 'object') return;
        if (!memberMap.has(member._id)) {
          memberMap.set(member._id, {
            ...member,
            projects: [{ _id: project._id, name: project.name, color: project.color }],
          });
        } else {
          memberMap.get(member._id)!.projects.push({ _id: project._id, name: project.name, color: project.color });
        }
      });
    });
    return Array.from(memberMap.values());
  }, [projects]);

  // Apply project filter and search
  const filteredMembers = useMemo(() => {
    let members = allMembers;
    if (projectFilter !== 'all') {
      members = members.filter((m) =>
        m.projects?.some((p: any) => p._id === projectFilter)
      );
    }
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      members = members.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
      );
    }
    return members;
  }, [allMembers, projectFilter, memberSearch]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColors = [
    'bg-blue-600', 'bg-purple-600', 'bg-green-600',
    'bg-rose-600', 'bg-amber-600', 'bg-cyan-600', 'bg-indigo-600',
  ];
  const getMemberColor = (id: string) => {
    const idx = id.charCodeAt(id.length - 1) % avatarColors.length;
    return avatarColors[idx];
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await teamApi.inviteMember({
        email,
        role,
        projectId: inviteProjectId || undefined,
      });
      setIsInviteModalOpen(false);
      setEmail('');
      setRole('member');
      setInviteProjectId('');
      await loadInvitations();
      await dispatch(fetchProjects());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {allMembers.length} member{allMembers.length !== 1 ? 's' : ''} across {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Project filter */}
          <div className="w-full sm:w-56">
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Team Members Grid */}
      <Card title={projectFilter === 'all' ? 'All Team Members' : `Members in "${projects.find(p => p._id === projectFilter)?.name}"`}>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {allMembers.length === 0 ? 'No team members yet' : 'No members found'}
            </p>
            {allMembers.length === 0 && (
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member: any) => (
              <div
                key={member._id}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 ${getMemberColor(member._id)} rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-xl`}>
                    {getInitials(member.name || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                    <Badge variant="info" className="mt-2" size="sm">
                      {(member.role || 'member').slice(0, 1).toUpperCase() + (member.role || 'member').slice(1)}
                    </Badge>
                  </div>
                </div>
                {/* Projects this member belongs to */}
                {member.projects && member.projects.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Projects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.projects.slice(0, 3).map((proj: any) => (
                        <span
                          key={proj._id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: proj.color || '#3b82f6' }}
                          />
                          {proj.name}
                        </span>
                      ))}
                      {member.projects.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          +{member.projects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
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
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Role: {invitation.role}
                        </span>
                        {invitation.projectId && (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: invitation.projectId.color || '#3b82f6' }}
                            />
                            {invitation.projectId.name}
                          </span>
                        )}
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          · Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
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

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setEmail('');
          setRole('member');
          setInviteProjectId('');
          setError(null);
        }}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
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
          <Select
            label="Invite to Project (optional)"
            value={inviteProjectId}
            onChange={(e) => setInviteProjectId(e.target.value)}
            options={[
              { value: '', label: 'Select Project' },
              ...projects.map((p) => ({ value: p._id, label: p.name })),
            ]}
          />
          {inviteProjectId && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
              <span>
                When accepted, this person will automatically be added to <strong>{projects.find(p => p._id === inviteProjectId)?.name}</strong>.
              </span>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsInviteModalOpen(false);
                setEmail('');
                setError(null);
                setInviteProjectId('');
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
