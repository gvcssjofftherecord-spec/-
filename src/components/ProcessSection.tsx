import React from 'react';
import { LucideIcon } from './LucideIcon';
import { motion } from 'motion/react';
import { ProcessStep } from '../types';

interface ProcessSectionProps {
  steps: ProcessStep[];
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ steps = [] }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="relative font-sans text-white">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(176,33,255,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-4 relative"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id || index}
              variants={itemVariants}
              className="group relative bg-[#121212] border border-white/5 hover:border-[#B021FF]/30 p-5 rounded-xl transition-all duration-300 flex flex-col justify-between min-h-[220px]"
            >
              {/* Index line overlay for desktops */}
              {index < steps.length - 1 && (
                <div className="hidden xl:block absolute top-[28%] -right-3 w-6 h-[1px] bg-white/10 group-hover:bg-[#B021FF]/40 transition-colors z-10" />
              )}

              {/* Icon & Index badge */}
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 group-hover:border-[#B021FF]/30 group-hover:text-[#B021FF] text-gray-400 flex items-center justify-center transition-all duration-300">
                  <LucideIcon name={step.icon} size={18} />
                </div>
                <span className="font-mono text-[10px] text-gray-500 group-hover:text-[#B021FF] transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Step info block */}
              <div className="space-y-2 mt-auto text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono tracking-widest text-gray-500 block uppercase">
                    {step.sub}
                  </span>
                  <h4 className="text-sm font-semibold tracking-tight text-white group-hover:text-white">
                    {step.title}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors line-clamp-4">
                  {step.desc}
                </p>
              </div>

              {/* Hover bottom highlight bar */}
              <div className="absolute bottom-0 inset-x-4 h-[2px] bg-transparent group-hover:bg-[#B021FF] rounded-t transition-all duration-300 shadow-[0_0_12px_rgba(176,33,255,0.8)]" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
