'use client'

import PhoneBundle from './PhoneBundle'

export default function PhoneBundleShowcase() {
  return (
    <div className="space-y-16 p-8 bg-gray-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">PhoneBundle Size Variants</h2>
        <p className="text-gray-600">Try these different sizes in various locations on your site</p>
      </div>
      
      {/* Small Size */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Small</h3>
        <PhoneBundle 
          size="small" 
          className="mb-4" 
          animationDelay={100}
        />
        <p className="text-sm text-gray-600">Perfect for sidebars or compact sections</p>
      </div>
      
      {/* Medium Size */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Medium (Default)</h3>
        <PhoneBundle 
          size="medium" 
          className="mb-4" 
          animationDelay={200}
        />
        <p className="text-sm text-gray-600">Great for hero sections and main content areas</p>
      </div>
      
      {/* Large Size */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Large</h3>
        <PhoneBundle 
          size="large" 
          className="mb-4" 
          animationDelay={300}
        />
        <p className="text-sm text-gray-600">Ideal for landing pages and feature showcases</p>
      </div>
      
      {/* No Animation Example */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Static (No Animation)</h3>
        <PhoneBundle 
          size="medium" 
          className="mb-4" 
          autoAnimate={false}
        />
        <p className="text-sm text-gray-600">Useful when you need instant display without animation</p>
      </div>
    </div>
  )
}
