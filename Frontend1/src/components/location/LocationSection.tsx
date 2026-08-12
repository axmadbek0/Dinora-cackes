import React from 'react';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';

export const LocationSection: React.FC = () => {
  // User's exact Google Maps location link
  const exactGoogleMapUrl = "https://www.google.com/maps/place/40%C2%B048'53.5%22N+68%C2%B040'50.5%22E/@40.8147824,68.6801478,183m/data=!3m1!1e3!4m4!3m3!8m2!3d40.814866!4d68.680686?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D";
  const mapEmbedUrl = 'https://maps.google.com/maps?q=40.814866,68.680686&z=17&output=embed';

  return (
    <section id="location" className="py-12 bg-[#FAF6F0] relative overflow-hidden border-t border-[#2B1810]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#F8E7EA] text-[#D65B78] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-[#D65B78]/20 shadow-sm">
            <MapPin className="w-4 h-4 text-[#D65B78]" />
            <span>Sirdaryo Tumani Markazi</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2B1810] tracking-tight">
            📍 Bizning Aniq Manzilimiz va Lokatsiya
          </h2>
          
          <p className="text-xs sm:text-sm text-[#6B5B52] leading-relaxed">
            DINORA shirinliklar studiyasi Sirdaryo tumani markazida joylashgan. Bizga tashrif buyuring yoki geolokatsiya orqali osongina topib keling!
          </p>
        </div>

        {/* Large Main Map Container */}
        <div className="bg-white p-3 sm:p-5 rounded-3xl border-2 border-[#CBB279]/40 shadow-xl">
          
          {/* Interactive Google Map Embed Frame */}
          <div className="w-full h-80 sm:h-96 md:h-[450px] rounded-2xl overflow-hidden border border-[#2B1810]/10 shadow-inner relative group bg-[#FAF6F0]">
            <iframe
              title="DINORA Shirinliklari Sirdaryo Tumani Lokatsiyasi"
              src={mapEmbedUrl}
              className="w-full h-full border-0 filter contrast-105"
              loading="lazy"
              allowFullScreen
            />

            {/* Floating Live Badge Over Map */}
            <div className="absolute top-4 left-4 bg-[#2B1810]/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg border border-[#CBB279]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>📍 DINORA Pastry & Art — Sirdaryo Tumani</span>
            </div>

            {/* Quick External Map Redirect Overlay Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
              <a
                href={exactGoogleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2B1810] hover:bg-[#3D2318] text-[#FAF6F0] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 border border-[#CBB279] active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4 text-[#D4AF37]" />
                <span>Google Maps'da Ochish</span>
                <ExternalLink className="w-3 h-3 text-white/70" />
              </a>

              <a
                href={exactGoogleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D65B78] hover:bg-[#c24b67] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps Navigatsiya</span>
                <ExternalLink className="w-3 h-3 text-white/80" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LocationSection;
