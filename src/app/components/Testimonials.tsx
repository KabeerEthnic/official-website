import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Bride',
    rating: 5,
    text: 'The lehenga I purchased for my wedding was absolutely stunning! The quality and craftsmanship exceeded my expectations. Thank you Kabeer for making my special day even more beautiful.',
    image: 'PS',
  },
  {
    id: 2,
    name: 'Anjali Patel',
    role: 'Fashion Enthusiast',
    rating: 5,
    text: 'I have been shopping from Kabeer for years now. Their collection is always fresh, authentic, and reasonably priced. The customer service is exceptional!',
    image: 'AP',
  },
  {
    id: 3,
    name: 'Meera Reddy',
    role: 'Corporate Professional',
    rating: 5,
    text: 'Perfect blend of traditional and contemporary designs. I love wearing their kurtis to work. Comfortable, elegant, and always receive compliments!',
    image: 'MR',
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative"
    >
      <Quote className="absolute top-6 right-6 w-12 h-12 text-[#f5ede6]" />
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6B2C3E] to-[#E89B3C] flex items-center justify-center text-white text-xl">
          {testimonial.image}
        </div>
        <div>
          <h4 className="text-xl text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#E89B3C] text-[#E89B3C]" />
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
    </motion.div>
  );
}

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#f5ede6]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4">
            What Our <span className="text-[#6B2C3E] font-serif italic">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from women who trust us for their ethnic wear needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}