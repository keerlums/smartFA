import { useState, useEffect } from 'react'

interface ResponsiveConfig {
  mobile: number
  tablet: number
  desktop: number
}

const defaultConfig: ResponsiveConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
}

export const useResponsive = (config: Partial<ResponsiveConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config }
  
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < finalConfig.mobile
  )
  
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= finalConfig.mobile && 
    window.innerWidth < finalConfig.tablet
  )
  
  const [isDesktop, setIsDesktop] = useState(
    window.innerWidth >= finalConfig.tablet
  )

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      setIsMobile(width < finalConfig.mobile)
      setIsTablet(width >= finalConfig.mobile && width < finalConfig.tablet)
      setIsDesktop(width >= finalConfig.tablet)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [finalConfig])

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile: screenSize.width < 480,
    isLargeMobile: screenSize.width >= 480 && screenSize.width < finalConfig.mobile,
    isLargeTablet: screenSize.width >= finalConfig.tablet && screenSize.width < finalConfig.desktop,
    isLargeDesktop: screenSize.width >= finalConfig.desktop
  }
}

export default useResponsive