import { motion } from 'framer-motion'
import { Heart, Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-dark-900 border-t border-dark-700 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-dark-400">Made with</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="text-dark-400">by RepoGenie Team</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-white transition-colors duration-200"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-white transition-colors duration-200"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-400 hover:text-white transition-colors duration-200"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dark-800 text-center text-dark-400 text-sm">
          <p>&copy; 2025 RepoGenie. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer