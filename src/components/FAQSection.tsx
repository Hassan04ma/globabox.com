import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface FAQSectionProps {
  language: Language;
}

export default function FAQSection({ language }: FAQSectionProps) {
  const isRtl = language === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qFr: "1. Est-ce que le paiement est à la livraison ?",
      qAr: "1. هل الدفع عند الاستلام ؟",
      qEn: "1. Is the payment Cash on Delivery?",
      aFr: "Oui, absolument ! Le paiement s'effectue en espèces (Cash on Delivery) uniquement au moment où le livreur vous remet votre colis en main propre à votre adresse au Maroc.",
      aAr: "نعم، بالتأكيد! الدفع يكون نقداً عند الاستلام فقط، أي بعد أن تصلك طلبيتك المغلفة لباب منزلك بالكامل وتفحصها يداً بيد من موزع الخدمة.",
      aEn: "Yes, absolutely! Payment is made in cash (Cash on Delivery) only once the courier hands your securely packed box directly to you."
    },
    {
      qFr: "2. Est-ce que vous livrez partout au Maroc ?",
      qAr: "2. هل تقومون بالتوصيل لكافة مدن المغرب ؟",
      qEn: "2. Do you ship everywhere in Morocco?",
      aFr: "Oui, nous livrons dans toutes les villes et provinces du Maroc (Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Oujda, Kenitra, Laâyoune etc.). La livraison est rapide et sécurisée.",
      aAr: "نعم، نحن نوفر خدمة الشحن السريع والآمن لتغطي جميع المدن والمقاطعات والمناطق بالمغرب دون استثناء وبكل أمان.",
      aEn: "Yes, we deliver to all cities, provinces, and regions across Morocco (including Casablanca, Rabat, Marrakech, Fez, Tangier, Agadir, Oujda, etc.)."
    },
    {
      qFr: "3. Combien de temps prend la livraison ?",
      qAr: "3. كم تستغرق مدة شحن وتوصيل الطلبية ؟",
      qEn: "3. How long does delivery take?",
      aFr: "La livraison prend généralement entre 24h et 48h selon votre localisation. Pour les grandes villes centrales, vous pouvez être livré dès le lendemain de votre confirmation téléphonique.",
      aAr: "يستغرق الشحن والتوصيل ما بين 24 إلى 48 ساعة فقط كأقصى تقدير. المدن الرئيسية الكبرى نغطيها ونسلمها غالباً في اليوم الموالي مباشرة لتأكيد الطلب.",
      aEn: "Delivery takes between 24 hours and 48 hours depending on your city. Major cities are usually delivered within 1 business day."
    },
    {
      qFr: "4. Comment confirmer ma commande ?",
      qAr: "4. كيف يمكنني تأكيد الطلبية الخاصة بي ؟",
      qEn: "4. How can I confirm my order?",
      aFr: "Dès que vous validez l'achat en ligne sur notre boutique, un conseiller de Globabox prend contact avec vous par appel téléphonique ou par message WhatsApp en moins de 30 minutes de 8h à 22h pour confirmer vos coordonnées de livraison.",
      aAr: "بمجرد إتمام كتابة معلوماتك والضغط على طلب، سيتصل بك أحد وكلائنا هاتفياً أو عبر مراسلة واتساب في أقل من 30 دقيقة لتأكيد العنوان وبدء الإرسال فوراً.",
      aEn: "Immediately after placing your order on our shop, a representative from Globabox will call or WhatsApp you within 30 minutes to verify details and queue the shipment."
    },
    {
      qFr: "5. Est-ce que je peux commander par WhatsApp ?",
      qAr: "5. هل يمكنني الطلب والمراسلة مباشرة عبر واتساب ؟",
      qEn: "5. Can I order directly via WhatsApp?",
      aFr: "Oui, tout à fait ! Vous pouvez cliquer sur notre bouton WhatsApp pour dialoguer directement avec nous au 0649264408. Nous pouvons prendre vos informations de livraison et valider votre colis directement par chat simple.",
      aAr: "نعم وبكل سرور! يمكنك الضغط على أيقونة الواتساب الخضراء للبدء في مراسلتنا والطلب مباشرة مع وكلائنا على الرقم 0649264408 بكل سهولة ودون عناء.",
      aEn: "Yes, absolutely! You can click any WhatsApp icon to reach our sales desk directly on 0649264408. We will register your coordinates and confirm your order through chat."
    }
  ];

  return (
    <section 
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      className="bg-slate-50 border-t border-b border-slate-200/60 py-16 px-4 sm:px-6 lg:px-8"
      id="faq-section"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>{isRtl ? "أسئلة شائعة ومتكررة" : "FOIRE AUX QUESTIONS"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {isRtl ? "هل لديك أي استفسار آخر ؟" : "Des questions sur vos achats chez Globabox ?"}
          </h2>
          <p className="mt-2 text-xs text-slate-500 font-medium font-sans">
            {isRtl 
              ? "إليك إجابات شافية وتفصيلية عن الأسئلة المعتادة لمساعدتك في إتمام مغامرتك بكل راحة بال وثقة."
              : "Retrouvez toutes les réponses claires sur le processus de livraison, de test colis, et de retour au Maroc."}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 font-bold text-slate-800 hover:text-orange-600 transition-colors cursor-pointer outline-none focus:outline-none"
                  style={{ textAlign: isRtl ? 'right' : 'left' }}
                >
                  <span className="text-xs sm:text-sm tracking-tight leading-snug">
                    {language === "ar" ? faq.qAr : language === "en" ? faq.qEn : faq.qFr}
                  </span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform text-slate-500 ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-100/75 bg-slate-50/50">
                    <p className="font-sans leading-relaxed text-slate-600">
                      {language === "ar" ? faq.aAr : language === "en" ? faq.aEn : faq.aFr}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
