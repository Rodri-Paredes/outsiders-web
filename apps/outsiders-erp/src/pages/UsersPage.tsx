import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Pencil, Trash2, KeyRound, ShieldCheck, User } from 'lucide-react';
import { userService } from '../services/userService';
import { branchService } from '../services/branchService';
import { User as UserType, Branch } from '../lib/types';
import { Button } from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toast from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';

type UserWithBranch = UserType & { branch?: Branch };

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'vendedor';
  branch_id: string;
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'vendedor',
  branch_id: '',
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithBranch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithBranch | null>(null);
  const [targetUser, setTargetUser] = useState<UserWithBranch | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, branchesData] = await Promise.all([
        userService.getUsers(),
        branchService.getBranches(),
      ]);
      setUsers(usersData);
      setBranches(branchesData);
    } catch (error) {
      Toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (user: UserWithBranch) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branch_id: user.branch_id ?? '',
    });
    setShowModal(true);
  };

  const openResetPassword = (user: UserWithBranch) => {
    setTargetUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          name: form.name,
          role: form.role,
          branch_id: form.branch_id || null,
        });
        Toast.success('Usuario actualizado');
      } else {
        if (!form.password || form.password.length < 6) {
          Toast.error('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        await userService.createUser(
          form.email,
          form.password,
          form.name,
          form.role,
          form.branch_id || null
        );
        Toast.success('Usuario creado correctamente');
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      Toast.error(error.message || 'Error al guardar usuario');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserWithBranch) => {
    if (user.id === currentUser?.id) {
      Toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    if (!confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    try {
      await userService.deleteUser(user.id);
      Toast.success('Usuario eliminado');
      loadData();
    } catch (error: any) {
      Toast.error(error.message || 'Error al eliminar usuario');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    if (newPassword.length < 6) {
      Toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await userService.resetPassword(targetUser.id, newPassword);
      setShowPasswordModal(false);

      // Si el admin cambió su propia contraseña, Supabase invalida la sesión.
      // Avisar y redirigir al login para que inicie sesión con la nueva contraseña.
      if (targetUser.id === currentUser?.id) {
        Toast.success('Contraseña actualizada. Inicia sesión nuevamente.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        Toast.success('Contraseña actualizada');
      }
    } catch (error: any) {
      Toast.error(error.message || 'Error al cambiar contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-black" /> Gestión de Usuarios
        </h1>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No hay usuarios registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sucursal</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="ml-2 text-xs text-gray-400">(tú)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4">
                      {u.role === 'admin' ? (
                        <Badge variant="primary" className="flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="info" className="w-fit">Vendedor</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {u.branch?.name ?? <span className="text-gray-400 italic">Sin sucursal</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openResetPassword(u)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cambiar contraseña"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.id === currentUser?.id}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  placeholder="Nombre completo"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              )}

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'vendedor' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal</label>
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Sin sucursal asignada</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h2>
              <p className="text-sm text-gray-500 mt-1">Usuario: <strong>{targetUser.name}</strong></p>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Cambiar contraseña'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
