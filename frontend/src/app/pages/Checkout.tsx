import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, CreditCard, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

export function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expDate: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(prev => prev + 1);

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>
      
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl text-center text-white mb-10"
          style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
        >
          Secure Checkout
        </motion.h1>

        {/* Stepper Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center w-full max-w-sm">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-[#E89B3C] text-white' : 'bg-white/10 text-white/50'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 rounded-full ${step >= 2 ? 'bg-[#E89B3C]' : 'bg-white/10'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-[#E89B3C] text-white' : 'bg-white/10 text-white/50'}`}>2</div>
            <div className={`flex-1 h-1 mx-2 rounded-full ${step >= 3 ? 'bg-[#E89B3C]' : 'bg-white/10'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-[#E89B3C] text-white' : 'bg-white/10 text-white/50'}`}>3</div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl text-white font-serif mb-6 flex items-center gap-3">
                  <div className="w-2 h-6 bg-[#E89B3C] rounded-full"></div> Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                  <div className="md:col-span-2">
                    <label className="block text-white/60 text-sm mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white/60 text-sm mb-2">Street Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm mb-2">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-2">PIN Code</label>
                      <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex justify-end">
                  <button onClick={nextStep} className="bg-[#531323] hover:bg-[#731830] text-white px-8 py-3 rounded-full transition-all">
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white font-serif flex items-center gap-3">
                    <div className="w-2 h-6 bg-[#E89B3C] rounded-full"></div> Payment Information
                  </h2>
                  <div className="flex gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <span className="text-white/60 text-sm">Secure 256-bit SSL</span>
                  </div>
                </div>

                <div className="bg-[#0F2418]/50 border border-white/10 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-white" />
                    <span className="text-white">Credit / Debit Card</span>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/60 text-sm mb-2">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors font-mono tracking-widest" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 text-sm mb-2">Expiry Date</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-2">CVV</label>
                        <input type="password" placeholder="***" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-10 border-t border-white/10 pt-8">
                  <button onClick={() => setStep(1)} className="text-white/60 hover:text-white transition-colors">
                    Back
                  </button>
                  <button onClick={nextStep} className="bg-[#531323] hover:bg-[#731830] text-white px-10 py-4 text-lg font-medium rounded-full transition-all shadow-lg hover:shadow-xl">
                    Pay ₹29,923.95
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-[#E89B3C]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#E89B3C]/50">
                  <Check className="w-12 h-12 text-[#E89B3C]" />
                </div>
                <h2 className="text-4xl text-white font-serif mb-4">Order Confirmed</h2>
                <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                  Thank you for your purchase! Your elegant piece of heritage is being prepared. Order #KAB-8A9F23
                </p>
                <Link to="/shop" className="inline-flex items-center gap-2 bg-white/10 hover:bg-[#E89B3C] hover:text-white border border-white/20 text-white px-8 py-3 rounded-full transition-all duration-300">
                  <ShoppingBag className="w-5 h-5" /> Continue Shopping
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
