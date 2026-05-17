import { Article, ContentBlock } from '../types';

const createBlock = (text: string, fontSize: any = 'medium', bold = false): ContentBlock => ({
  id: Math.random().toString(36).substr(2, 9),
  type: 'paragraph',
  text: text.replace(/<[^>]*>/g, '').trim(),
  style: {
    bold,
    italic: false,
    underline: false,
    fontSize,
    alignment: 'left'
  }
});

export const demoArticles: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Mehazabien Chowdhury: The Quiet Evolution of an Icon",
    slug: "mehazabien-chowdhury-evolution-icon",
    excerpt: "In the rapidly shifting landscape of Bangladeshi media, Mehazabien Chowdhury stands as a testament to disciplined growth and artistic integrity.",
    content: [
      createBlock("The Philosophy of Silence", 'large', true),
      createBlock("Mehazabien Chowdhury represents a new era of Bangladeshi stardom—one defined not by noise, but by a consistent, high-quality body of work that speaks for itself."),
      createBlock("As we navigate the heights of 2026, her impact on the television and digital landscape remains unparalleled, bridging the gap between mainstream popularity and critical acclaim."),
      createBlock("Acting is not about being someone else; it's about finding the truth within yourself and bringing it to the surface.", 'medium', true),
      createBlock("Her journey from the early days of Lux Channel i Superstar to becoming the most sought-after performer in the country is a lesson in patience and craft.")
    ],
    category: "Cinema",
    status: "published",
    featured: true,
    author: "Editors of The Reserve",
    image: {
      url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=2000",
      credit: "Photo via Channel i Online",
      source: "https://channelionline.com"
    },
    mobileImage: {
      url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=800&h=1200&fit=crop",
      credit: "Photo via Channel i Online",
      source: "https://channelionline.com"
    },
    mobileCropX: 35,
    readTime: "8 min",
    date: "May 2026"
  },
  {
    title: "Rubaba Dowla: Architecting Connectivity",
    slug: "rubaba-dowla-architecting-connectivity",
    excerpt: "A deep dive into how one of Bangladesh's most influential business leaders is reshaping the telecommunications and tech landscape.",
    content: [
      createBlock("Rubaba Dowla's career has been a masterclass in corporate leadership and strategic vision. From her pivotal roles in Grameenphone and Airtel to her current influence as a mentor and strategist, she has consistently been at the forefront of the nation's digital revolution."),
      createBlock("In this exclusive interview, we discuss the challenges of the 4IR (Fourth Industrial Revolution) and how Bangladesh is positioning itself as a global tech hub.")
    ],
    category: "Business",
    status: "published",
    featured: false,
    author: "Sabbir Ahmed",
    image: {
      url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2000",
      credit: "Image courtesy of Oracle Bangladesh",
      source: "https://oracle.com"
    },
    readTime: "12 min",
    date: "April 2026"
  },
  {
    title: "Sabina Khatun: The Captain's Legacy",
    slug: "sabina-khatun-captains-legacy",
    excerpt: "How Sabina Khatun transformed women's football in Bangladesh into a national movement of pride and excellence.",
    content: [
      createBlock("Sabina Khatun isn't just a footballer; she is a pioneer. Under her leadership, the Bangladesh women's national team has reached heights previously thought impossible, culminating in their historic SAFF Championship victories."),
      createBlock("We explore her journey from the fields of Satkhira to the global stage, and the fire that continues to drive her to mentor the next generation of athletes like Maria Manda and Marufa Akter.")
    ],
    category: "Sports",
    status: "published",
    featured: false,
    author: "Refat Chowdhury",
    image: {
      url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=2000",
      credit: "Photo via BFF Media",
      source: "https://bff.com.bd"
    },
    readTime: "10 min",
    date: "May 2026"
  },
  {
    title: "Bidya Sinha Mim: Beyond the Screen",
    slug: "bidya-sinha-mim-beyond-screen",
    excerpt: "Exploring the multifaceted career of Bidya Sinha Mim and her impact on South Asian cinema.",
    content: [
      createBlock("Bidya Sinha Mim continues to redefine herself as an actress and a brand, moving seamlessly between commercial blockbusters and artistically demanding projects...")
    ],
    category: "Cinema",
    status: "published",
    featured: true,
    author: "Zahin Rahman",
    image: {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2000",
      credit: "Photo via Prothom Alo",
      source: "https://prothomalo.com"
    },
    readTime: "6 min",
    date: "June 2026"
  },
  {
    title: "Kamal Quadir: The bKash Revolution",
    slug: "kamal-quadir-bkash-revolution",
    excerpt: "How Kamal Quadir's vision brought financial inclusion to millions and changed the currency of a nation.",
    content: [
      createBlock("The story of bKash is the story of modern Bangladesh—a leapfrog into the future of digital finance...")
    ],
    category: "Business",
    status: "published",
    featured: false,
    author: "Editorial Team",
    image: {
      url: "https://images.unsplash.com/photo-1556742049-0ad345654321?q=80&w=2000",
      credit: "Image via bKash Media",
      source: "https://bkash.com"
    }
  },
  {
    title: "Chanchal Chowdhury: The Master of Metamorphosis",
    slug: "chanchal-chowdhury-metamorphosis",
    excerpt: "From Monpura to Karagar, Chanchal Chowdhury discusses his immersive approach to character and the weight of public expectation.",
    content: [
      createBlock("Chanchal Chowdhury's ability to disappear into a role is unmatched in contemporary South Asian cinema...")
    ],
    category: "Cinema",
    status: "published",
    featured: false,
    author: "Nabila Kamal",
    image: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000",
      credit: "Photo via Chorki",
      source: "https://chorki.com"
    }
  },
  {
    title: "Maria Manda: The Future of Midfield",
    slug: "maria-manda-midfield-future",
    excerpt: "Meet the powerhouse behind Bangladesh's dominant women's football team.",
    content: [
      createBlock("Maria Manda's tenacity on the pitch is balanced by her humility off it. She represents the new face of Bangladeshi sportsmanship...")
    ],
    category: "Sports",
    status: "published",
    featured: false,
    author: "Sports Desk",
    image: {
      url: "https://images.unsplash.com/photo-1517603951030-d0553586cd1b?q=80&w=2000",
      credit: "Daily Star Sports",
      source: "https://thedailystar.net"
    }
  },
  {
    title: "Jaya Ahsan: A Cinematic Bridge",
    slug: "jaya-ahsan-cinematic-bridge",
    excerpt: "How Jaya Ahsan became the most acclaimed actress across two Bengals.",
    content: [
      createBlock("Jaya Ahsan's journey from Dhaka to Kolkata is one of boundary-breaking talent and exquisite choice of script...")
    ],
    category: "Cinema",
    status: "published",
    featured: false,
    author: "Editorial",
    image: {
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2000",
      credit: "Photo via Instagram",
      source: "https://instagram.com/jaya.ahsan"
    }
  }
];
