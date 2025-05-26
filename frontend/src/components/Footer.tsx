import React from "react";
import {Separator} from "./ui/separator";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8">
              <img
                src="/bleaktreewhite.png"
                alt="Bleak"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="font-bold text-xl text-white"
              style={{fontFamily: "'Orbitron', monospace"}}
            >
              bleak
            </span>
          </div>

          <div className="flex items-center gap-6 text-white/50 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Twitter
            </a>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="text-center text-white/50 text-sm">
          © 2025 Bleak. Built with ❤️ for developers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
