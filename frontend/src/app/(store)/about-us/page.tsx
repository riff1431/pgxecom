export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About FreshMart</h1>
      
      <div className="prose prose-emerald max-w-none">
        <p className="text-xl text-gray-600 leading-relaxed mb-8 text-center">
          FreshMart is more than just an e-commerce platform. We are a journey dedicated to bringing pristine, unadulterated nature directly to your doorstep.
        </p>

        <div className="my-12 aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 overflow-hidden">
          {/* Main Hero Image Placeholder */}
          <span className="text-xl">Our Journey Image</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          In a world full of artificial additives and endless processing, our mission is to provide 100% genuine and organic food products to health-conscious consumers across Bangladesh. We believe that good health starts with good food.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The Origin of Our Quality</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          We source directly from the roots. Our flagship product—raw Sundarbans honey—is collected by expert completely traditional Mawals Deep inside the largest mangrove forest. Every drop is handled with care to ensure the medicinal properties remain completely intact. We apply the same rigorous sourcing ideology to our dates, spices, and organic dry foods.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
           <div className="bg-emerald-50 p-6 rounded-xl text-center">
              <h3 className="font-bold text-emerald-800 mb-2">100% Organic</h3>
              <p className="text-sm text-emerald-700">No chemicals, no compromises.</p>
           </div>
           <div className="bg-emerald-50 p-6 rounded-xl text-center">
              <h3 className="font-bold text-emerald-800 mb-2">Direct Sourcing</h3>
              <p className="text-sm text-emerald-700">Supporting local farmers directly.</p>
           </div>
           <div className="bg-emerald-50 p-6 rounded-xl text-center">
              <h3 className="font-bold text-emerald-800 mb-2">Eco Packaging</h3>
              <p className="text-sm text-emerald-700">Sustainable for the environment.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
