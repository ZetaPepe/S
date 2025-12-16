"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function Footer() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <footer className="relative">
      {/* Main CTA */}
      <motion.a
        href="mailto:hello@example.com"
        data-cursor-hover
        className="relative block overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Curtain */}
        <motion.div
          className="absolute inset-0 bg-[#2563eb]"
          initial={{ y: "100%" }}
          animate={{ y: isHovered ? "0%" : "100%" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Content */}
        <div className="relative py-16 md:py-24 px-8 md:px-12 border-t border-white/10" />
      </motion.a>
    </footer>
  )
}
