import { Article } from '../../types';

interface ResponsiveImageProps {
  article: Article;
  className?: string;
  containerClassName?: string;
  imageClassName?: string;
  aspectRatio?: string;
  priority?: boolean;
  grayscale?: boolean;
  hoverScale?: boolean;
}

export default function ResponsiveImage({
  article,
  className = '',
  containerClassName = '',
  imageClassName = '',
  aspectRatio = 'aspect-[16/9]',
  grayscale = true,
  hoverScale = true
}: ResponsiveImageProps) {
  const { image, mobileImage, mobileCropX = 50 } = article;
  
  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${containerClassName}`}>
      <picture className="block w-full h-full">
        {mobileImage?.url && (
          <source media="(max-width: 768px)" srcSet={mobileImage.url} />
        )}
        <img 
          src={image?.url || undefined} 
          alt={article.title}
          className={`w-full h-full object-cover transition-all duration-1000 
            ${grayscale ? 'grayscale md:group-hover:grayscale-0' : ''} 
            ${hoverScale ? 'md:group-hover:scale-105' : ''} 
            ${imageClassName} ${className}`}
          style={{ 
            objectPosition: `${mobileCropX}% 50%`
          }}
          referrerPolicy="no-referrer"
        />
      </picture>
      
      {/* Editorial Overlay on Mobile for better text readability and luxury feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden pointer-events-none" />
      
      {/* Fallback blurred background for centered portrait images on mobile if no mobile image exists */}
      {!mobileImage?.url && (
        <div className="absolute inset-0 -z-10 md:hidden overflow-hidden bg-zinc-900 pointer-events-none">
          <img 
            src={image?.url || undefined} 
            className="w-full h-full object-cover blur-3xl opacity-20 scale-125"
            alt=""
          />
        </div>
      )}
    </div>
  );
}
