# Phone Components

This folder contains reusable phone-related components for showcasing mobile app screenshots.

## Components

### PhoneBundle

A 3D animated phone stack component that displays three phone screenshots with a dynamic slide-in animation.

#### Props

- `size?: 'small' | 'medium' | 'large'` - Controls the size of the phone bundle (default: 'medium')
- `className?: string` - Additional CSS classes to apply
- `autoAnimate?: boolean` - Whether to automatically trigger the slide animation (default: true)
- `animationDelay?: number` - Delay in milliseconds before animation starts (default: 500)

#### Usage Examples

```tsx
// Basic usage with default medium size
<PhoneBundle />

// Small size for sidebars
<PhoneBundle size="small" className="my-4" />

// Large size with custom delay
<PhoneBundle size="large" animationDelay={1000} />

// Static display without animation
<PhoneBundle autoAnimate={false} />
```

#### Size Variants

- **Small**: 200px container width - Perfect for sidebars or compact sections
- **Medium**: 300px container width - Great for hero sections and main content areas  
- **Large**: 400px container width - Ideal for landing pages and feature showcases

### PhoneBundleShowcase

A demonstration component that shows all size variants and animation options. Useful for testing and choosing the right configuration.

#### Usage

```tsx
<PhoneBundleShowcase />
```

## Implementation Notes

- Uses CSS 3D transforms with `perspective` for the 3D effect
- Responsive design with `max-width: 80%` constraint
- Optimized image loading with Next.js Image component
- Smooth transitions with configurable timing
- Self-contained animation state management
