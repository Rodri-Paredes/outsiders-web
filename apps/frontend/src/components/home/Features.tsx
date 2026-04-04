'use client';

const features = [
  {
    title: 'Premium Quality',
    description: 'High-quality materials and craftsmanship in every piece',
    icon: '✨',
  },
  {
    title: 'Worldwide Shipping',
    description: 'Fast and secure delivery to your doorstep',
    icon: '🌍',
  },
  {
    title: 'Limited Editions',
    description: 'Exclusive drops and limited collections',
    icon: '🔥',
  },
  {
    title: 'Secure Payment',
    description: 'Safe and encrypted transactions',
    icon: '🔒',
  },
];

export function Features() {
  return (
    <section className="section-padding bg-dark-bg">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group"
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-white text-lg font-light mb-3 tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-light text-sm font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
