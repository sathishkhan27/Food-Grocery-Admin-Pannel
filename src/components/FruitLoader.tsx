import React from 'react';
import { motion } from "motion/react";
import { Zap, ShoppingBag, Bike, Timer, Sparkles } from "lucide-react";

const FruitLoader = () => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background Gradient Blurs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-100 rounded-full blur-[100px] opacity-60 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-100 rounded-full blur-[100px] opacity-60 animate-pulse delay-700" />
      
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-24 h-24 bg-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-200 border-4 border-white">
            <Zap className="w-12 h-12 text-white fill-white" />
          </div>
          
          {/* Floating Accents */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              x: [0, 10, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white"
          >
            <Sparkles className="w-5 h-5 fill-white" />
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <div className="text-center space-y-1">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-black tracking-tighter text-slate-900"
          >
            Ping<span className="text-orange-600 italic">Zo</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]"
          >
            Lightning Fast Deliveries
          </motion.p>
        </div>

        {/* Loading Indicators */}
        <div className="flex gap-4 mt-8">
          {[ShoppingBag, Bike, Timer].map((Icon, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: i * 0.2
              }}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 text-slate-300 text-[9px] font-bold uppercase tracking-widest"
      >
        Initializing PingZo Logistics Node...
      </motion.div>
    </div>
  );
};

export default FruitLoader;
