import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { userAPI, projectAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function AddMemberModal({ isOpen, onClose, projectId, onMemberAdded }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const roleOptions = [
    { value: 'manager', label: 'Quản lý', color: 'text-blue-600' },
    { value: 'member', label: 'Thành viên', color: 'text-gray-600' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      console.log('📋 Fetching users list...');
      const response = await userAPI.getUsers();
      const userList = response.data || [];
      setUsers(userList);
      setFilteredUsers(userList);
      console.log('✅ Users loaded:', userList.length);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error('Vui lòng chọn người dùng');
      return;
    }

    try {
      setIsLoading(true);
      console.log('👥 Adding member to project:', {
        projectId,
        userId: selectedUser.userId,
        role: selectedRole
      });

      await projectAPI.addProjectMember(projectId, {
        userId: selectedUser.userId,
        role: selectedRole
      });

      toast.success(`Đã thêm ${selectedUser.name || selectedUser.username} vào dự án`);
      
      // Reset form
      setSelectedUser(null);
      setSelectedRole('member');
      setSearchTerm('');
      
      // Notify parent to refresh data
      if (onMemberAdded) {
        onMemberAdded();
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error adding member:', error);
      toast.error('Không thể thêm thành viên. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Thêm thành viên
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search Users */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm người dùng
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Tìm theo tên, username hoặc email..."
            />
          </div>
        </div>

        {/* Users List */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn người dùng
          </label>
          <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
            {isLoadingUsers ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Không tìm thấy người dùng' : 'Không có người dùng'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.userId}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    selectedUser?.userId === user.userId ? 'bg-red-50 border-red-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-700">
                        {(user.name || user.username)?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.username && user.name && (
                        <p className="text-xs text-gray-400">@{user.username}</p>
                      )}
                    </div>
                    {selectedUser?.userId === user.userId && (
                      <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vai trò
          </label>
          <div className="space-y-2">
            {roleOptions.map((role) => (
              <label key={role.value} className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mr-3 text-red-600 focus:ring-red-500"
                />
                <span className={`text-sm font-medium ${role.color}`}>
                  {role.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Selected User Preview */}
        {selectedUser && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-1">Người được chọn:</p>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs font-medium text-gray-700">
                  {(selectedUser.name || selectedUser.username)?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-900">
                {selectedUser.name || selectedUser.username}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                - {roleOptions.find(r => r.value === selectedRole)?.label}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleAddMember}
            disabled={!selectedUser || isLoading}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Thêm thành viên
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}