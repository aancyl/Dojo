import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }: { title: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
  >
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-dojo-red/20 flex items-center justify-center mb-6">
      <Construction className="w-12 h-12 text-primary" />
    </div>
    <h1 className="text-3xl font-display font-bold gradient-text-cyber mb-2">{title}</h1>
    <p className="text-muted-foreground max-w-md">
      This module is coming soon. The foundation is built and ready for expansion.
    </p>
  </motion.div>
);

export default PlaceholderPage;
