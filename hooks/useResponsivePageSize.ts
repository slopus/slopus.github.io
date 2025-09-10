import { useState, useEffect } from 'react'

export function useResponsivePageSize() {
  const [pageSize, setPageSize] = useState(18) // Default to lg breakpoint

  useEffect(() => {
    const updatePageSize = () => {
      const width = window.innerWidth
      
      // Page sizes chosen to limit scrolling to approximately 3 screens worth of content,
      // preventing overwhelming users while browsing large result sets (493+ items)
      if (width < 640) { // Below sm
        setPageSize(8)  // 1 column × 8 rows
      } else if (width < 1024) { // sm to lg  
        setPageSize(10) // 2 columns × 5 rows
      } else if (width < 1280) { // lg to xl
        setPageSize(18) // 3 columns × 6 rows
      } else { // xl and above
        setPageSize(20) // 4 columns × 5 rows
      }
    }

    // Set initial page size
    updatePageSize()

    // Listen for window resize
    window.addEventListener('resize', updatePageSize)

    return () => {
      window.removeEventListener('resize', updatePageSize)
    }
  }, [])

  return pageSize
}