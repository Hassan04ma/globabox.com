import type { ReactNode } from 'react';
import {
  BarChart3, ClipboardList, ExternalLink, LayoutDashboard, LogOut,
  Package, PanelLeft, Plus, RefreshCw, Tags, X
} from 'lucide-react';

type AdminTab = 'dashboard' | 'orders' | 'products' | 'categories' | 'marketing';

interface AdminWorkspaceLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onClose: () => void;
  onLogout: () => void;
  ordersCount: number;
  pendingOrders: number;
  productsCount: number;
  categoriesCount: number;
  databaseReady: boolean | undefined;
  showProductAction: boolean;
  onNewProduct: () => void;
  onPrepareProduct: () => void;
  onPendingOrders: () => void;
  onRefreshOrders: () => void;
  isRefreshing: boolean;
  children: ReactNode;
}

export default function AdminWorkspaceLayout({
  activeTab, onTabChange, onClose, onLogout, ordersCount, pendingOrders,
  productsCount, categoriesCount, databaseReady, showProductAction,
  onNewProduct, onPrepareProduct, onPendingOrders, onRefreshOrders,
  isRefreshing, children
}: AdminWorkspaceLayoutProps) {
  const sections = [
    { id: 'dashboard' as const, label: 'Tableau de bord', sub: 'Vue générale · نظرة عامة', icon: LayoutDashboard },
    { id: 'orders' as const, label: 'Commandes', sub: 'Ventes · الطلبات', icon: ClipboardList, count: ordersCount },
    { id: 'products' as const, label: 'Produits', sub: 'Catalogue · المنتجات', icon: Package, count: productsCount },
    { id: 'categories' as const, label: 'Catégories', sub: 'Organisation · الأقسام', icon: Tags, count: categoriesCount },
    { id: 'marketing' as const, label: 'Marketing', sub: 'Mesures · التسويق', icon: BarChart3 }
  ];
  const selectedSection = sections.find(item => item.id === activeTab) ?? sections[0];

  const navButton = (item: typeof sections[number], mobile = false) => {
    const Icon = item.icon;
    const selected = activeTab === item.id;
    return (
      <button key={item.id} type="button" aria-current={selected ? 'page' : undefined}
        onClick={() => onTabChange(item.id)}
        className={`group flex min-h-[48px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 ${mobile ? 'shrink-0' : 'w-full'} ${selected ? 'border-orange-500/30 bg-orange-600 text-white' : 'border-transparent text-slate-300 hover:bg-[#223958] hover:text-white'}`}>
        <Icon size={18} className={selected ? 'text-white' : 'text-slate-400 group-hover:text-white'} aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="whitespace-nowrap text-[13px] font-semibold">{item.label}</span>
          {!mobile && <span className={`mt-0.5 text-[10px] ${selected ? 'text-orange-50' : 'text-slate-500'}`}>{item.sub}</span>}
        </span>
        {item.count !== undefined && (
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${selected ? 'bg-orange-700 text-white' : 'bg-[#203451] text-slate-200'}`}>{item.count}</span>
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#081221] font-sans text-white">
      <header className={`flex h-[76px] shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-6 ${activeTab === 'categories' ? 'border-slate-200 bg-white' : 'border-[#253955] bg-[#0c1a30]'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-sm font-black shadow-lg shadow-orange-950/20" aria-hidden="true">GB</div>
          <div className="min-w-0">
            <h1 className={`truncate text-base font-extrabold sm:text-lg ${activeTab === 'categories' ? 'text-[#101d37]' : 'text-white'}`}>GLOBABOX <span className="font-medium text-slate-400">/ Espace marchand</span></h1>
            <p className="hidden text-xs text-slate-400 sm:block">Commandes, produits, stock et performances</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className={`hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold sm:flex ${databaseReady ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-400' : 'border-amber-800/60 bg-amber-950/30 text-amber-300'}`}>
            <span className={`h-2 w-2 rounded-full ${databaseReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {databaseReady ? 'Base D1 connectée' : 'Base D1 à vérifier'}
          </div>
          <a href="https://globabox.com" target="_blank" rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#223958] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 md:inline-flex">
            <ExternalLink size={15} aria-hidden="true" /> Voir la boutique
          </a>
          <button type="button" onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/50 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
            aria-label="Se déconnecter">
            <LogOut size={15} aria-hidden="true" /><span className="hidden sm:inline">Déconnexion</span>
          </button>
          <button type="button" onClick={onClose} aria-label="Fermer l'administration"
            className="rounded-lg p-2 text-slate-400 hover:bg-[#223958] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
            <X size={19} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#253955] bg-[#0c1a30] px-3 py-6 lg:flex">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Menu principal</p>
          <nav aria-label="Navigation administration" className="flex flex-col gap-1.5">
            {sections.map(section => navButton(section))}
          </nav>
          <div className="mt-auto rounded-2xl border border-[#2b3e59] bg-[#14243e] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <PanelLeft size={17} className="text-orange-400" aria-hidden="true" /> Centre de gestion
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {pendingOrders} commande(s) en attente. Les expéditions AMEEX sont gérées manuellement.
            </p>
            <button type="button" onClick={onPendingOrders}
              className="mt-3 rounded-lg text-left text-xs font-semibold text-orange-400 hover:text-orange-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400">
              Voir les commandes à traiter
            </button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <nav aria-label="Navigation administration mobile" className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#253955] bg-[#0c1a30] px-3 py-2 lg:hidden">
            {sections.map(section => navButton(section, true))}
          </nav>
          <div className={`flex shrink-0 flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 ${activeTab === 'categories' ? 'hidden' : 'border-[#20314d] bg-[#0b172b]'}`}>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-orange-400">GLOBABOX / ADMINISTRATION</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white">{selectedSection.label}</h2>
              <p className="mt-0.5 text-xs text-slate-400">{selectedSection.sub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === 'products' && showProductAction && (
                <>
                  <button type="button" onClick={onPrepareProduct}
                    className="rounded-lg border border-sky-700 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-900/40">Préparer CAMEL 40</button>
                  <button type="button" onClick={onNewProduct}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-500">
                    <Plus size={16} aria-hidden="true" /> Nouveau produit
                  </button>
                </>
              )}
              {activeTab === 'orders' && (
                <button type="button" onClick={onRefreshOrders} disabled={isRefreshing}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#223958] disabled:opacity-50">
                  <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
                  Actualiser
                </button>
              )}
            </div>
          </div>
          <main className={`min-h-0 flex-1 overflow-y-auto ${activeTab === 'categories' ? 'bg-[#f5f7fc]' : 'bg-[#081221]'}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
