import React, { useState } from 'react';
import { Star, LayoutGrid, CheckCircle, Quote, MessageSquare, MapPin } from 'lucide-react';
import { Language } from '../types';

interface CustomerReviewsProps {
  language: Language;
}

const REVIEWS = [
  {
    id: "rev-1",
    name: "Mohamed E.",
    city: "Casablanca",
    cityAr: "الدار البيضاء",
    cityEn: "Casablanca",
    rating: 5,
    date: "14 Juin 2026",
    productBoughtFr: "Tente Dôme Giga-6",
    productBoughtAr: "خيمة القبة العملاقة Giga-6",
    productBoughtEn: "Dome Tent Giga-6",
    commentFr: "Livraison ultra rapide ! Reçue chez moi à Casablanca en un temps record de 24h. Le colis est arrivé parfaitement scellé, m'offrant un service irréprochable.",
    commentAr: "توصيل سريع للغاية! استلمت طلبي في الدار البيضاء في وقت قياسي أقل من 24 ساعة. وصل المغلف مغلقاً بإتقان مع معاملة ممتازة.",
    commentEn: "Extremely fast delivery! Received at my home in Casablanca within a record 24 hours. The parcel arrived pristine and well-protected.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "rev-2",
    name: "Amina L.",
    city: "Rabat",
    cityAr: "الرباط",
    cityEn: "Rabat",
    rating: 5,
    date: "11 Juin 2026",
    productBoughtFr: "Sac de couchage thermique",
    productBoughtAr: "كيس نوم حراري",
    productBoughtEn: "Thermal Sleeping Bag",
    commentFr: "Le produit est exactement comme sur la photo de présentation du site. Aucune mauvaise surprise sur les couleurs ni sur la qualité des matériaux, c'est identique à ce que j'ai commandé.",
    commentAr: "المنتج مطابق تماماً للصور المعروضة في المتجر الإلكتروني. جودة مثالية وخامات ممتازة دون أي تغيير في الألوان أو التفاصيل الفنية.",
    commentEn: "The product is exactly as shown in the catalog photos. Perfect quality, exact matches in color and materials without any bad surprises.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "rev-3",
    name: "Hamza B.",
    city: "Marrakech",
    cityAr: "مراكش",
    cityEn: "Marrakech",
    rating: 5,
    date: "08 Juin 2026",
    productBoughtFr: "Réchaud de camping Pro",
    productBoughtAr: "موقد التخييم الاحترافي Pro",
    productBoughtEn: "Camping Gas Stove Pro",
    commentFr: "Le service client sur WhatsApp est très professionnel. Ils répondent instantanément, m'ont envoyé des photos réelles du réchaud et ont assuré le suivi personnalisé jusqu'à la livraison.",
    commentAr: "خدمة العملاء الاحترافية على الواتساب مذهلة وسريعة للغاية. أجابوا فوراً على استفساراتي وأرسلوا لي صوراً حقيقية للمنتج وتابعوا التوصيل خطوة بخطوة.",
    commentEn: "The WhatsApp customer service is highly professional. They reply instantly, sent real photos of the stove, and carefully followed my delivery.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  },
  {
    id: "rev-4",
    name: "Youssef T.",
    city: "Marrakesh",
    cityAr: "مراكش",
    cityEn: "Marrakesh",
    rating: 5,
    date: "02 Juin 2026",
    productBoughtFr: "Sac à dos Adventure 65L",
    productBoughtAr: "حقيبة الظهر للمغامرات 65 لتر",
    productBoughtEn: "Adventure Backpack 65L",
    commentFr: "Le rapport qualité/prix est tout simplement exceptionnel pour du matériel de camping de ce niveau au Maroc. C'est robuste, ergonomique et très accessible.",
    commentAr: "أفضل قيمة مقابل السعر ممكنة في المغرب لمثل هذه المعدات والأدوات الرياضية. جودة وخامات قوية وعملية وبسعر مناسب وممتاز جداً.",
    commentEn: "The price-to-quality ratio of this camping gear is outstanding. Solid, robust, highly ergonomic structure at an extremely fair price point in Morocco.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  }
];

export default function CustomerReviews({ language }: CustomerReviewsProps) {
  const isRtl = language === "ar";

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="customer-reviews-section"
    >
      {/* Visual statistics card */}
      <div className="bg-gradient-to-r from-blue-950 to-[#0B1528] rounded-3xl p-8 border border-blue-900 text-white mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-block bg-orange-600 text-white font-sans text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            {isRtl ? "آراء زبنائنا بالمغرب" : "EXPÉRIENCE CLIENT GLOBABOX"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {isRtl ? "أكثر من +1,400 زبون يثق بنا" : "Plus de 1400 clients satisfaits au Maroc"}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {isRtl 
              ? "نحن ملتزمون بتقديم أفضل الخدمات والضمانات الحقيقية لضمان تجربة الشراء الآمنة والمريحة مع كامل الطمأنينة."
              : "La satisfaction de nos aventuriers est notre priorité absolue. Lisez les témoignages vérifiés de campeurs à Casablanca, Rabat, Marrakech et Tanger !"}
          </p>
        </div>

        {/* Dynamic statistics counter */}
        <div className="bg-[#122037] border border-[#213757] rounded-2xl p-5 px-8 shrink-0 text-center flex flex-col items-center justify-center">
          <div className="flex items-center text-amber-400 gap-1 mb-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-2xl font-black text-white font-mono">4.9 / 5.0</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            {isRtl ? "متوسط تقييم الخدمة والمنتج" : "Note moyenne globale"}
          </p>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {REVIEWS.map((review) => (
          <div 
            key={review.id}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(30,41,59,0.08)] hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between group"
          >
            <div>
              {/* Review header details */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={review.avatar} 
                    alt={review.name} 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-11 h-11 object-cover rounded-full border-2 border-slate-100"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-[#f97316] transition-colors">{review.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wide flex items-center gap-1">
                      <MapPin size={10} className="text-orange-500 shrink-0" />
                      <span>{isRtl ? `المدينة: ${review.cityAr}` : `Ville: ${review.city}`}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center text-amber-400 gap-0.5 justify-end">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{review.date}</span>
                </div>
              </div>

              {/* Review description content text */}
              <div className="relative mb-5 leading-relaxed text-xs text-slate-650 font-sans italic">
                <Quote className="w-8 h-8 text-slate-100 absolute -top-5 left-0 -z-10 transform scale-x-[-1]" />
                <p className="relative z-10 text-slate-600 line-clamp-4 leading-relaxed font-sans font-medium">
                  {language === "ar" ? review.commentAr : language === "en" ? review.commentEn : review.commentFr}
                </p>
              </div>
            </div>

            {/* Tags bought info */}
            <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-500 text-xs">✔</span>
                <span className="text-emerald-600 text-[10px] uppercase tracking-wide">
                  {isRtl ? "مشتري حقيقي مؤكد" : "ACHETEUR VÉRIFIÉ"}
                </span>
              </div>
              <div className="bg-slate-100 text-slate-650 px-2.5 py-1 rounded text-[10px] font-bold">
                🎁 {language === "ar" ? review.productBoughtAr : language === "en" ? review.productBoughtEn : review.productBoughtFr}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
