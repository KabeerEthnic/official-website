import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, Heart, MapPin, User, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

const MOCK_ORDERS = [
  { id: 'KAB-8A9F23', date: 'Oct 24, 2025', status: 'Processing', total: '₹29,923', items: 2 },
  { id: 'KAB-7K2M19', date: 'Sep 12, 2025', status: 'Delivered', total: '₹15,499', items: 1 }
];

export function Account() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <h1 className="text-3xl text-white mb-8" style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}>My Account</h1>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <p className="text-white font-medium">Priya Sharma</p>
                <p className="text-white/50 text-sm">priya@example.com</p>
              </div>
              
              <nav className="flex flex-col p-2 space-y-1">
                {[
                  { id: 'orders', icon: Package, label: 'My Orders' },
                  { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                  { id: 'addresses', icon: MapPin, label: 'Saved Addresses' },
                  { id: 'profile', icon: User, label: 'Profile Details' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeTab === item.id 
                        ? 'bg-[#E89B3C]/10 text-[#E89B3C] font-medium' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
                
                <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 mt-4 transition-all text-left">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 min-h-[500px]"
            >
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl text-white font-serif mb-6 pb-4 border-b border-white/10">Order History</h2>
                  <div className="space-y-4">
                    {MOCK_ORDERS.map(order => (
                      <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all cursor-pointer group">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-medium">{order.id}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-500/20 text-green-300' : 'bg-[#E89B3C]/20 text-[#E89B3C]'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-white/50 text-sm">{order.date} • {order.items} {order.items > 1 ? 'items' : 'item'}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                          <span className="text-xl text-white font-medium">{order.total}</span>
                          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab !== 'orders' && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <p className="text-white/60 text-lg font-serif italic mb-2">Content coming soon</p>
                  <p className="text-white/40 text-sm">This section is currently under development.</p>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
