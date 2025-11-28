import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading users from API
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          username: 'tudtse184093',
          name: 'DANG THANH TU',
          email: 'tudtse184093@fpt.edu.vn',
          phone: '+84 123 456 789',
          role: 'manager',
          status: 'active',
          projectCount: 5,
          taskCount: 23,
          joinedDate: '2024-01-15',
          lastLogin: '2024-11-28 09:30',
        },
        {
          id: 2,
          username: 'nguyenvana',
          name: 'Nguyen Van A',
          email: 'nguyenvana@company.com',
          phone: '+84 987 654 321',
          role: 'member',
          status: 'active',
          projectCount: 3,
          taskCount: 15,
          joinedDate: '2024-02-20',
          lastLogin: '2024-11-27 16:45',
        },
        {
          id: 3,
          username: 'tranthib',
          name: 'Tran Thi B',
          email: 'tranthib@company.com',
          phone: '+84 456 789 123',
          role: 'viewer',
          status: 'inactive',
          projectCount: 1,
          taskCount: 8,
          joinedDate: '2024-03-10',
          lastLogin: '2024-11-20 14:20',
        },
        {
          id: 4,
          username: 'levanc',
          name: 'Le Van C',
          email: 'levanc@company.com',
          phone: '+84 789 123 456',
          role: 'admin',
          status: 'active',
          projectCount: 8,
          taskCount: 45,
          joinedDate: '2024-01-01',
          lastLogin: '2024-11-28 08:15',
        },
        {
          id: 5,
          username: 'phamthid',
          name: 'Pham Thi D',
          email: 'phamthid@company.com',
          phone: '+84 321 654 987',
          role: 'member',
          status: 'pending',
          projectCount: 0,
          taskCount: 0,
          joinedDate: '2024-11-25',
          lastLogin: 'Chưa đăng nhập',
        },
      ];
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-800' },
      manager: { label: 'Quản lý', color: 'bg-blue-100 text-blue-800' },
      member: { label: 'Thành viên', color: 'bg-green-100 text-green-800' },
      viewer: { label: 'Người xem', color: 'bg-gray-100 text-gray-800' },
    };
    
    const config = roleConfig[role] || roleConfig.member;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: 'bg-green-100 text-green-800' },
      inactive: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('Xóa người dùng thành công!');
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success('Cập nhật trạng thái thành công!');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhân viên</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tên, email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="manager">Quản lý</option>
            <option value="member">Thành viên</option>
            <option value="viewer">Người xem</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="pending">Chờ xác nhận</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hoạt động
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đăng nhập cuối
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {user.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getStatusBadge(user.status)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.projectCount} dự án
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.taskCount} nhiệm vụ
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    {user.status === 'active' ? (
                      <button
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Vô hiệu hóa"
                        onClick={() => handleStatusChange(user.id, 'inactive')}
                      >
                        <UserIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Kích hoạt"
                        onClick={() => handleStatusChange(user.id, 'active')}
                      >
                        <UserIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhân viên</h3>
          <p className="mt-1 text-sm text-gray-500">
            Không tìm thấy nhân viên nào phù hợp với tìm kiếm của bạn.
          </p>
        </div>
      )}
    </div>
  );
}