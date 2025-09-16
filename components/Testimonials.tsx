import React from 'react';
import './Testimonials.css';

// Types for testimonials data
export interface Testimonial {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: React.ReactNode;
  media?: {
    type: 'image' | 'video';
    url: string;
    alt?: string;
  };
  date: string;
  likes?: number;
  sourceUrl: string;
}

// Testimonial Author Component
const TestimonialAuthor: React.FC<{ author: Testimonial['author']; sourceUrl: string }> = ({ author, sourceUrl }) => (
  <div className="sj-endorser-view-container">
    <div className="sj-avatar-container">
      <img
        src={author.avatar}
        alt={`${author.name} avatar`}
        className="w-[42px] h-[42px] rounded-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="w-full">
      <div className="sj-endorser-name font-medium text-gray-900">{author.name}</div>
      <div className="sj-desc text-sm text-gray-500">@{author.handle}</div>
    </div>
    <div className="sj-spacer"></div>
    <div className="sj-integration-fixed-icon flex-none">
      <a href={sourceUrl} target="_blank" rel="nofollow" aria-label="View on X (Twitter)">
        <img
          alt="twitter"
          width="20"
          height="20"
          src="/wall-of-love/x-logo_Q29Cxf5Qo.png"
          className="w-5 h-5 object-contain"
        />
      </a>
    </div>
  </div>
);

// Testimonial Content Component
const TestimonialContent: React.FC<{ content: React.ReactNode; media?: Testimonial['media'] }> = ({ content, media }) => (
  <>
    <div className="sj-content text-left">
      <div>
        <div 
          className="overflow-hidden line-clamp-10"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 10,
            WebkitBoxOrient: 'vertical' as any
          }}
        >
          {content}
        </div>
      </div>
    </div>
    {media && (
      <div className="sj-attachment-container overflow-hidden rounded-lg">
        {media.type === 'video' ? (
          <video controls className="sj-media w-full h-auto">
            <source src={media.url} type="video/mp4" />
          </video>
        ) : (
          <img
            loading="lazy"
            className="sj-media w-full h-auto"
            src={media.url}
            alt={media.alt || ''}
          />
        )}
      </div>
    )}
  </>
);

// Testimonial Footer Component
const TestimonialFooter: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="sj-card-details sj-sub mt-4 flex items-center gap-2 text-sm text-gray-500">
    <a href={testimonial.sourceUrl} target="_blank" rel="nofollow" className="opacity-70 hover:opacity-100" aria-label="Like this post">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sj-heart"
      >
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
      </svg>
    </a>
    {testimonial.likes && <div className="opacity-70">{testimonial.likes}</div>}
    <div className="opacity-70">{testimonial.date}</div>
    <div className="flex-grow"></div>
  </div>
);

// Individual Testimonial Card Component
const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="w-full">
    <div className="sj-card text-left bg-white rounded-2xl shadow-sm">
      <div className="sj-text-card sj-endorser-layout-default flex flex-col">
        <div className="sj-card-content flex flex-col">
          <TestimonialAuthor author={testimonial.author} sourceUrl={testimonial.sourceUrl} />
          <TestimonialContent content={testimonial.content} media={testimonial.media} />
          <TestimonialFooter testimonial={testimonial} />
        </div>
      </div>
    </div>
  </div>
);

// Layout type definition
export type TestimonialLayout = 'horizontal' | 'vertical' | 'masonry';

// Main Testimonials Container Component
const TestimonialsContainer: React.FC<{ 
  testimonials: Testimonial[];
  layout?: TestimonialLayout;
}> = ({ testimonials, layout = 'horizontal' }) => {
  // Use CSS classes for responsive layout - no JavaScript calculations needed
  const containerClass = layout === 'masonry' 
    ? 'testimonials-masonry' 
    : 'testimonials-horizontal';

  return (
    <div className="p-7" data-id="d4c7d44a-95be-4b3c-978f-4ba863490a54">
      <div className="sj-container">
        <div className="relative w-full px-0">
          <div className="w-full">
            <div className={containerClass}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id}>
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample testimonials data (you can replace this with your actual data)
const sampleTestimonials: Testimonial[] = [
  {
    id: '1',
    author: {
      name: 'Geert Jan Sloos',
      handle: 'geertjansloos',
      avatar: '/wall-of-love/ADAc42xWwxCuPUIHmNH4QuOg.webp'
    },
    content: (
      <>
        <a href="https://twitter.com/levelsio" target="_blank" rel="nofollow noopener noreferrer">@levelsio</a> Happy also great app to run agents with Claude Code
      </>
    ),
    media: {
      type: 'image',
      url: '/wall-of-love/Gy0jIybXAAAGaTi.jpg',
      alt: 'Screenshot'
    },
    date: 'Aug 20, 2025',
    sourceUrl: 'https://x.com/geertjansloos/status/1958260147471487159'
  },
  {
    id: '2',
    author: {
      name: 'Nate Stewart',
      handle: 'becomevocal',
      avatar: '/wall-of-love/dN4u2zBGcUN4tBmGayKl7iVr.webp'
    },
    content: (
      <>
        Made some progress today on a CLI you can also talk to
        <br /><br />
        Pretty happy with the UX of it even though it's no where near "done" 😅😅😅
        <br /><br />
        Major shout out to <a href="https://twitter.com/Ex3NDR" target="_blank" rel="nofollow noopener noreferrer">@Ex3NDR</a> who built , a remote Claude Code app I used as an excuse to build this feature on the go
      </>
    ),
    media: {
      type: 'video',
      url: '/wall-of-love/8pmWbcjxhLyarBtH.mp4'
    },
    date: 'Aug 15, 2025',
    likes: 12,
    sourceUrl: 'https://x.com/becomevocal/status/1956513622282355148'
  },
  {
    id: '3',
    author: {
      name: 'Karl Marx',
      handle: 'PeoplesGrocers',
      avatar: '/wall-of-love/o573ySEEgMf1bYnjrFoWMhZU.webp'
    },
    content: (
      <>
        I've tried CodeRemote, YoloCode, Omnara, Claudia, Conductor, Cursor Agents, Kisuke is taking forever to ship, Tonkotsu, Terragon Labs.
        <br /><br />
        Nothing beats <a href="https://github.com/slopus/happy" target="_blank" rel="nofollow noopener noreferrer">github.com/slopus/happy</a> with Claude Code. Simple, #OpenSource, and free for the win 🥇
      </>
    ),
    date: 'Aug 20, 2025',
    sourceUrl: 'https://x.com/PeoplesGrocers/status/1958391019181072851'
  },
  {
    id: '4',
    author: {
      name: 'Pawel Manowiecki',
      handle: 'pawel_mano',
      avatar: '/wall-of-love/tZfc7BY5nJLCzpNpNxpZK1bl.webp'
    },
    content: (
      <>
        <a href="https://twitter.com/borisandcrispin" target="_blank" rel="nofollow noopener noreferrer">@borisandcrispin</a> <a href="https://twitter.com/Ex3NDR" target="_blank" rel="nofollow noopener noreferrer">@Ex3NDR</a> <a href="https://twitter.com/PeoplesGrocers" target="_blank" rel="nofollow noopener noreferrer">@PeoplesGrocers</a> <a href="https://twitter.com/bra1n_dump" target="_blank" rel="nofollow noopener noreferrer">@bra1n_dump</a> which slash commands are supported now? /init worked, but e.g. /agents & /costs not… anyway huge UI jump in last version 😍
      </>
    ),
    media: {
      type: 'image',
      url: '/wall-of-love/Gxa_v_AWYAAwEWQ.jpg',
      alt: 'Screenshot'
    },
    date: 'Aug 3, 2025',
    likes: 1,
    sourceUrl: 'https://x.com/pawel_mano/status/1951958325509161322'
  }
];

// Default export with sample data
const Testimonials: React.FC<{ layout?: TestimonialLayout }> = ({ layout }) => {
  return <TestimonialsContainer testimonials={sampleTestimonials} layout={layout} />;
};

export default Testimonials;
export { TestimonialsContainer, TestimonialCard, TestimonialAuthor, TestimonialContent, TestimonialFooter };