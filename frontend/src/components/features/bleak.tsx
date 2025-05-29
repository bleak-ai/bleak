import {useState, useEffect} from "react";
import {ArrowDown} from "lucide-react";
import {Label} from "../ui/label";
import {Button} from "../ui/button";

const DELAY_PER_LETTER = 180;
const INITIAL_DELAY = 50;

export default function Bleak() {
  const [showImage, setShowImage] = useState(false);
  const [animateLetters, setAnimateLetters] = useState(false);
  const letters = ["b", "l", "e", "a", "k"];

  useEffect(() => {
    // Start letter animation
    const letterTimer = setTimeout(() => {
      setAnimateLetters(true);
    }, 100);

    const iconDelay = letters.length * DELAY_PER_LETTER + INITIAL_DELAY;
    // Show image after letters finish
    const imageTimer = setTimeout(() => {
      setShowImage(true);
    }, iconDelay);

    return () => {
      clearTimeout(letterTimer);
      clearTimeout(imageTimer);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center pt-[30%] min-h-screen overflow-hidden">
      {/* Main content */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 px-4">
        {/* Title with animated letters */}
        <h1
          className="flex text-white font-bold tracking-tight z-20"
          style={{fontFamily: "'Orbitron', monospace"}}
        >
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`inline-block opacity-0 transition-all duration-200 text-6xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[140px] 2xl:text-[180px] ${
                animateLetters
                  ? "animate-letter-drop gradient-text animate-glow "
                  : ""
              }`}
              style={{
                animationDelay: `${index * DELAY_PER_LETTER + INITIAL_DELAY}ms`,
                animationFillMode: "forwards"
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Tree image with reveal */}
        <div className="relative">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48">
            <img
              src="/bleaktreewhite.png"
              alt="Bleak Tree"
              className={`w-full h-full object-contain transition-all duration-1500 ease-out ${
                showImage ? "animate-tree-grow" : "opacity-0"
              }`}
              style={{
                clipPath: showImage
                  ? "inset(0% 0% 0% 0%)"
                  : "inset(100% 0% 0% 0%)"
              }}
            />
          </div>
        </div>
      </div>
      <p
        className={`text-white font-extrabold transition-all duration-2000 animate fade-in mt-10 ${
          showImage ? "opacity-100" : "opacity-0"
        }`}
        style={{fontFamily: "monospace"}}
      >
        {" "}
        Make your Chatbot appealing
      </p>

      <a
        href="/#chat "
        className={`w-full h-full object-contain transition-all duration-3000  ease-in mt-10 ${
          showImage ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button>See bleak in Action!</Button>
      </a>

      <Label className="absolute bottom-30 opacity-50">
        How it works <ArrowDown className="animate-pulse" />
      </Label>
    </div>
  );
}
