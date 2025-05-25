import React, {useState, useEffect} from "react";

export default function Landing() {
  const [showImage, setShowImage] = useState(false);
  const [animateLetters, setAnimateLetters] = useState(false);
  const letters = ["B", "l", "e", "a", "k"];

  useEffect(() => {
    // Start letter animation immediately
    setAnimateLetters(true);

    // Show image after letters finish falling (delay for dramatic effect)
    const imageTimer = setTimeout(() => {
      setShowImage(true);
    }, 500);

    return () => clearTimeout(imageTimer);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      <div className="flex items-center justify-center gap-8">
        <h1 className="text-white md:text-[240px] flex">
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`inline-block opacity-0  ${
                animateLetters
                  ? "animate-bounce-in"
                  : "transform translate-y-[-100vh] opacity-0"
              }`}
              style={{
                animationDelay: `${index * 150}ms`,
                animationDuration: "0.2s",
                animationFillMode: "forwards"
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <div className="relative w-[150px] h-[150px} ">
          <img src="/bleaktreewhite.png" width={150} height={150} />
          <div
            className={`absolute z-10 top-0 w-[200px] h-[200px] bg-background transition-all duration-2000 ease-out ${
              showImage
                ? "transform -translate-y-60 opacity-100"
                : "transform translate-y-2 opacity-100"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}
