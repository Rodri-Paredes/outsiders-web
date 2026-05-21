'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/database.types';
import { authService } from '@/services/auth.service';
import { ordersService } from '@/services/orders.service';
import { favoritesService } from '@/services/favorites.service';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, UserIcon, Heart, Lock, LogOut, Package, Calendar, ChevronRight, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

type Tab = 'orders' | 'data' | 'favorites' | 'password';

export default function ProfileContent() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const tabs: { id: Tab; label: string; icon: typeof ShoppingBag }[] = [
    { id: 'orders', label: 'Mis Compras', icon: ShoppingBag },
    { id: 'data', label: 'Mis Datos', icon: UserIcon },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'password', label: 'Contraseña', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-[0.3em] text-black mb-1">Mi Cuenta</h1>
            <p className="text-[11px] text-gray-400 tracking-wide">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cerrar sesión</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar tabs */}
          <div className="md:w-52 flex-shrink-0">
            <nav className="flex flex-col gap-0.5 md:border-r md:border-gray-100 md:pr-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                      isActive
                        ? 'text-black'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="pb-8">
              {activeTab === 'orders' && <OrdersTab userId={user.id} />}
              {activeTab === 'data' && <DataTab user={user} />}
              {activeTab === 'favorites' && <FavoritesTab userId={user.id} />}
              {activeTab === 'password' && <PasswordTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== ORDERS TAB ===================== */
function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService.getWhatsappOrdersByUser(userId)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <TabSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No tienes compras aún"
        description="Cuando realices tu primera compra aparecerá aquí."
        action={{ label: 'Ir a la tienda', href: '/shop' }}
      />
    );
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
    enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
    entregado: { label: 'Entregado', color: 'bg-gray-100 text-gray-800' },
    cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black mb-8">Historial de Compras</h2>
      <div className="space-y-4">
        {orders.map((order) => {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          const status = statusLabels[order.status] || statusLabels.pendiente;
          return (
            <div key={order.id} className="border border-gray-100 p-5 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-black">Pedido #{order.id}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('es-BO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              {/* Items */}
              <div className="space-y-2 mb-3">
                {Array.isArray(items) && items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name || item.product_name} <span className="text-gray-400">x{item.quantity}</span>
                      {item.size && <span className="text-gray-400 ml-1">({item.size})</span>}
                    </span>
                    <span className="font-medium text-black">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {order.delivery_method === 'pickup' ? 'Recojo en tienda' : order.city || 'Envío'}
                </span>
                <span className="text-sm font-bold text-black">Total: {formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== DATA TAB ===================== */
function DataTab({ user }: { user: User }) {
  const [name, setName] = useState(user.name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await authService.updateProfile(user.id, { name, last_name: lastName, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black mb-8">Mis Datos</h2>
      <div className="space-y-5 max-w-md">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Nombres</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Apellidos</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
            placeholder="Tu apellido"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
            placeholder="+591 xxxxxxx"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Correo electrónico</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full px-4 py-3 border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-400 mt-1">El correo no se puede cambiar</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

/* ===================== FAVORITES TAB ===================== */
function FavoritesTab({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    favoritesService.getFavorites(userId)
      .then(setFavorites)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFavorites(); }, [userId]);

  const handleRemove = async (productId: string) => {
    try {
      await favoritesService.removeFavorite(userId, productId);
      setFavorites(prev => prev.filter(f => f.product_id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <TabSkeleton />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No tienes favoritos"
        description="Guarda productos que te gusten para encontrarlos fácilmente."
        action={{ label: 'Explorar productos', href: '/shop' }}
      />
    );
  }

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black mb-8">Mis Favoritos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {favorites.map((fav) => {
          const product = fav.product;
          if (!product) return null;
          return (
            <div key={fav.id} className="group relative">
              <Link href={`/producto/${product.id}`} className="block">
                <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden mb-3 border border-gray-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl font-bold">
                      {product.name.charAt(0)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(product.id); }}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
                    title="Eliminar de favoritos"
                  >
                    <X className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
                <div className="px-0.5">
                  <h3 className="text-[11px] text-black capitalize tracking-tight font-medium">{product.name.toLowerCase()}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-800 font-medium">Bs {product.price}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-[10px] text-gray-400 line-through">Bs {product.original_price}</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== PASSWORD TAB ===================== */
function PasswordTab() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No se encontró el email');

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-black mb-4">Cambiar Contraseña</h2>
      <p className="text-xs text-gray-400 mb-8 max-w-md">
        Por seguridad, no almacenamos ni mostramos tu contraseña. Para cambiarla, te enviaremos un enlace seguro a tu correo electrónico.
      </p>

      {sent ? (
        <div className="border border-green-200 p-5 max-w-md">
          <p className="text-xs text-green-700 font-medium">
            ✓ Se envió un enlace de recuperación a tu correo. Revisa tu bandeja de entrada.
          </p>
        </div>
      ) : (
        <>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="bg-black text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de cambio de contraseña'}
          </button>
        </>
      )}
    </div>
  );
}

/* ===================== SHARED COMPONENTS ===================== */
function TabSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof ShoppingBag;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-16">
      <Icon className="w-8 h-8 text-gray-200 mx-auto mb-4" strokeWidth={1.5} />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-black mb-2">{title}</h3>
      <p className="text-xs text-gray-400 mb-8">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-block bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
