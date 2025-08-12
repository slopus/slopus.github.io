'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface PhoneBundleProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
  autoAnimate?: boolean
  animationDelay?: number
}

const sizeConfig = {
  small: {
    containerWidth: 160,
    imageWidth: 214,
    imageHeight: 462,
    translateDistance: 32,
    translateY: 12,
    translateZ: -28,
    leftRotation: -12,
    rightRotation: 12,
    yRotation: 15,
    xRotation: 8,
  },
  medium: {
    containerWidth: 300,
    imageWidth: 400,
    imageHeight: 866,
    translateDistance: 120,
    translateY: 20,
    translateZ: -50,
    leftRotation: -15,
    rightRotation: 15,
    yRotation: 25,
    xRotation: 10,
  },
  large: {
    containerWidth: 400,
    imageWidth: 533,
    imageHeight: 1155,
    translateDistance: 160,
    translateY: 25,
    translateZ: -65,
    leftRotation: -15,
    rightRotation: 15,
    yRotation: 25,
    xRotation: 10,
  }
}

export default function PhoneBundle({ 
  size = 'medium', 
  className = '', 
  autoAnimate = true,
  animationDelay = 500 
}: PhoneBundleProps) {
  const [isLoaded, setIsLoaded] = useState(!autoAnimate)
  const config = sizeConfig[size]

  useEffect(() => {
    if (!autoAnimate) return
    
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, animationDelay)

    return () => clearTimeout(timer)
  }, [autoAnimate, animationDelay])

  return (
    <div className={`relative ${className}`}>
      <div 
        className="relative mx-auto"
        style={{ 
          perspective: '1000px',
          width: `${config.containerWidth}px`,
          maxWidth: '80%',
          height: 'auto'
        }}
      >
        {/* App 2 - slides to the left */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            transform: isLoaded 
              ? `translateX(-${config.translateDistance}px) translateY(${config.translateY}px) translateZ(${config.translateZ}px) rotate(${config.leftRotation}deg) rotateY(${config.yRotation}deg) rotateX(${config.xRotation}deg)`
              : 'translateX(0px) translateY(0px) translateZ(0px) rotate(0deg) rotateY(0deg) rotateX(0deg)',
            transformOrigin: 'bottom center',
            transformStyle: 'preserve-3d',
            filter: isLoaded 
              ? 'drop-shadow(20px 10px 30px rgba(0,0,0,0.3))'
              : 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
            zIndex: 1
          }}
        >
          <Image
            src="/app-1.png"
            alt="Claude Code in Happy Coder App Screenshot 2"
            width={config.imageWidth}
            height={config.imageHeight}
            className="w-full h-auto"
          />
        </div>

        {/* App 1 - slides to the right */}
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            transform: isLoaded 
              ? `translateX(${config.translateDistance}px) translateY(${config.translateY}px) translateZ(${config.translateZ}px) rotate(${config.rightRotation}deg) rotateY(-${config.yRotation}deg) rotateX(${config.xRotation}deg)`
              : 'translateX(0px) translateY(0px) translateZ(0px) rotate(0deg) rotateY(0deg) rotateX(0deg)',
            transformOrigin: 'bottom center',
            transformStyle: 'preserve-3d',
            filter: isLoaded 
              ? 'drop-shadow(-20px 10px 30px rgba(0,0,0,0.3))'
              : 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
            zIndex: 1
          }}
        >
          <Image
            src="/app-3.png"
            alt="Claude Code in Happy Coder App Screenshot"
            width={config.imageWidth}
            height={config.imageHeight}
            className="w-full h-auto"
          />
        </div>

        {/* App 3 - main image on top */}
        <div 
          className="relative z-10 transition-all duration-1000 ease-out"
          style={{
            filter: isLoaded 
              ? 'drop-shadow(0px 5px 15px rgba(0,0,0,0.2))'
              : 'drop-shadow(0px 0px 0px rgba(0,0,0,0))',
            transform: isLoaded 
              ? 'translateZ(10px)'
              : 'translateZ(0px)',
            transformStyle: 'preserve-3d'
          }}
        >
          <Image
            src="/app-2.png"
            alt="Claude Code in Happy Coder App Screenshot 3"
            width={config.imageWidth}
            height={config.imageHeight}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  )
}
