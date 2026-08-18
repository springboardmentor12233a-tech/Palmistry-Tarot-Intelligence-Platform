import { motion } from "framer-motion";

function Hero() {
  return (
    <section className="hero">

      <motion.h1
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Destiny is Written in Your Hands
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
      >
        Discover the hidden stories within your palm and uncover guidance through the wisdom of Tarot.
      </motion.p>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        Enter the Oracle
      </motion.button>

    </section>
  );
}

export default Hero;