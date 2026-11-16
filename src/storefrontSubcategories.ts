import type { Language, Product } from './types';

export interface StoreSubcategory {
  id: string;
  parent: string;
  name: Record<Language,string>;
  /** Product names and descriptions can be matched when no admin subcategory is assigned. */
  terms: string[];
}

const sub=(parent:string,id:string,fr:string,ar:string,en:string,terms:string[]):StoreSubcategory=>
  ({parent,id,name:{fr,ar,en},terms});

export const STORE_SUBCATEGORIES:StoreSubcategory[] = [
 sub('maison','decoration','Décoration','الديكور','Decoration',['décor','decor','زينة','ديكور','vase','cadre','coussin','مخدة']),
 sub('maison','rangement','Rangement','التنظيم والتخزين','Storage & Organization',['rangement','storage','organis','منظم','تخزين','رفوف','étagère']),
 sub('maison','salle-de-bain','Salle de bain','الحمام','Bathroom',['bain','bathroom','douche','حمام','منشفة','towel','porte-serviette']),
 sub('maison','textile','Linge de maison','المفروشات','Home Textiles',['drap','linge','couverture','rideau','مفرش','ستارة','textile']),
 sub('cuisine','ustensiles','Ustensiles de cuisine','أدوات المطبخ','Kitchen Utensils',['ustensile','ملعقة','ملاعق','couteau','knife','poêle','مقلاة','casserole']),
 sub('cuisine','cuisson','Cuisson & appareils','أجهزة الطهي','Cooking Appliances',['air fryer','fryer','four','friteuse','grill','cuisinière','طهي','فرن','قلاية','grille-pain']),
 sub('cuisine','mixeurs','Mixeurs & préparation','الخلاطات والتحضير','Blenders & Preparation',['mixeur','blender','moulin','hachoir','خلاط','مطحنة','محضر']),
 sub('cuisine','conservation','Conservation & rangement','حفظ وتخزين الأغذية','Food Storage',['boîte alimentaire','thermos','lunch box','conservation','حافظة','حفظ الطعام','علبة طعام']),
 sub('technologie','telephone','Téléphones & tablettes','الهواتف واللوحات','Phones & Tablets',['téléphone','smartphone','iphone','redmi','samsung galaxy','tablet','هاتف','تابلت']),
 sub('technologie','audio','Audio & écouteurs','السماعات والصوتيات','Audio & Headphones',['écouteur','casque','earbud','airpod','speaker','سماعة','bluetooth']),
 sub('technologie','chargeurs','Chargeurs & batteries','الشواحن والبطاريات','Charging & Power',['chargeur','charger','power bank','battery','batterie externe','شاحن','باور بنك']),
 sub('technologie','informatique','Informatique & accessoires','الحواسيب وملحقاتها','Computers & Accessories',['ordinateur','laptop','clavier','souris','usb hub','حاسوب','كيبورد','mouse']),
 sub('beaute','cheveux','Cheveux & coiffure','الشعر والتصفيف','Hair Care',['cheveux','sèche-cheveux','lisseur','hair','شعر','مجفف','مكواة شعر']),
 sub('beaute','rasage','Rasage & soin','الحلاقة والعناية','Grooming',['rasoir','tondeuse','shaver','rasage','حلاقة','ماكينة حلاقة']),
 sub('beaute','maquillage','Maquillage & beauté','المكياج والتجميل','Makeup & Beauty',['maquillage','makeup','rouge à lèvres','cosmétique','مكياج','أحمر شفاه']),
 sub('beaute','parfums','Parfums & accessoires','العطور والإكسسوارات','Fragrance & Accessories',['parfum','fragrance','perfume','عطر']),
 sub('mode','sacs','Sacs & maroquinerie','الحقائب والمنتجات الجلدية','Bags & Leather',['sac à main','handbag','sac bandoulière','maroquin','حقيبة يد','محفظة']),
 sub('mode','accessoires','Accessoires de mode','إكسسوارات الموضة','Fashion Accessories',['lunettes','bijou','montre','ceinture','نظارة','حزام','إكسسوار']),
 sub('mode','vetements','Vêtements','الملابس','Clothing',['veste','chemise','t-shirt','pantalon','jacket','ملابس','قميص','سروال']),
 sub('automobile','supports','Supports téléphone','حوامل الهاتف','Phone Mounts',['support téléphone','phone mount','حامل هاتف','support voiture']),
 sub('automobile','charge-auto','Chargeurs voiture','شواحن السيارات','Car Chargers',['chargeur voiture','chargeur auto','car charger','شاحن سيارة']),
 sub('automobile','entretien-auto','Entretien & nettoyage','التنظيف والصيانة','Car Care',['auto lavage','car wash','entretien auto','polish','تنظيف السيارة','ملمع']),
 sub('automobile','equipements','Équipements voiture','تجهيزات السيارات','Car Equipment',['compresseur','pompe auto','gonfleur','camera voiture','كاميرا سيارة','نفخ العجلات']),
 sub('sport_loisirs','fitness','Fitness & musculation','اللياقة والعضلات','Fitness',['fitness','musculation','gym','dumbbell','رياضة','أوزان']),
 sub('sport_loisirs','yoga','Yoga & accessoires','اليوغا والإكسسوارات','Yoga & Accessories',['yoga','tapis de sport','مت السجادة','يوغا']),
 sub('enfants','jouets','Jeux & jouets','الألعاب','Toys & Games',['jouet','toy','jeu enfant','لعبة','ألعاب']),
 sub('enfants','bebe','Accessoires bébé','مستلزمات الرضع','Baby Essentials',['bébé','baby','nourrisson','رضيع','طفل صغير']),
 sub('jardin','jardinage','Outils de jardinage','أدوات البستنة','Gardening Tools',['jardinage','garden tools','arrosoir','plant','نبات','حديقة']),
 sub('jardin','mobilier','Mobilier de jardin','أثاث الحديقة','Outdoor Furniture',['mobilier de jardin','terrasse','chair garden','أثاث حديقة']),
 sub('entretien','nettoyage','Matériel de nettoyage','أدوات التنظيف','Cleaning Tools',['balai','serpillière','brosse','mop','مكنسة','مساحة','فرشاة']),
 sub('entretien','entretien-produits','Produits d’entretien','مواد التنظيف','Cleaning Supplies',['détergent','lessive','savon','nettoyant','منظف','صابون']),
 sub('entretien','aspirateurs','Aspirateurs','المكانس الكهربائية','Vacuum Cleaners',['aspirateur','vacuum','مكنسة كهربائية']),
 sub('eclairage','lampes','Lampes & luminaires','المصابيح والإنارة','Lamps & Luminaires',['lampe','lamp','luminaire','مصباح','أباجور']),
 sub('eclairage','led','Éclairage LED','إضاءة ليد','LED Lighting',['led','ruban lumineux','شريط ضوئي','ليد']),
 sub('animaux','chiens','Pour chiens','للكلاب','For Dogs',['chien','dog','كلب','كلاب']),
 sub('animaux','chats','Pour chats','للقطط','For Cats',['chat','cat','قطط','قطة']),
 sub('animaux','alimentation','Alimentation animaux','غذاء الحيوانات','Pet Food',['croquette','pet food','aliment animal','غذاء حيوان','طعام قطط']),
 sub('animaux','jouets-animaux','Jouets & accessoires','ألعاب وإكسسوارات الحيوانات','Pet Toys & Accessories',['jouet animal','pet toy','laisse','collier animal','طوق','لعبة قطط']),
 sub('bureau','fournitures','Fournitures de bureau','لوازم المكتب','Office Supplies',['stylo','cahier','fourniture','دفتر','قلم','papier']),
 sub('bureau','organisation','Organisation & rangement','التنظيم والتخزين','Desk Organization',['organisateur bureau','desk organizer','classeur','منظم مكتب','ملفات'])
];

export const getStoreSubcategories=(parent:string)=>STORE_SUBCATEGORIES.filter(x=>x.parent===parent);

const normal=(value:unknown)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

export function matchesSubcategory(product:Product,subcatId:string):boolean{
  const rule=STORE_SUBCATEGORIES.find(x=>x.id===subcatId);
  if(!rule)return false;
  // Admin-assigned category codes are authoritative if added to a product record.
  const tagged=(product as Product & {subcategory?:string;subCategory?:string}).subcategory ||
    (product as Product & {subcategory?:string;subCategory?:string}).subCategory;
  if(tagged)return tagged===subcatId;
  const searchable=normal([
    product.name?.fr, product.name?.ar, product.name?.en,
    product.description?.fr, product.description?.ar, product.description?.en
  ].filter(Boolean).join(' '));
  return rule.terms.some(t=>searchable.includes(normal(t)));
}
