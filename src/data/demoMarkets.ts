import { CropType, CropCategory } from '../types';
export const cropOptions: {
  id: CropType;
  labelEn: string;
  labelTe: string;
  labelHi: string;
  labelMr: string;
  category: Exclude<CropCategory, 'all'>;
  unit: string;
  typicalYieldText: string;
  icon: string;
}[] = [
  { id: 'Tomato', labelEn: 'Tomato', labelTe: 'టమాటా', labelHi: 'टमाटर', labelMr: 'टोमॅटो', category: 'vegetables', unit: 'kg', typicalYieldText: 'Fresh vegetable - Perishable', icon: '🍅' },
  { id: 'Rice', labelEn: 'Rice (Paddy)', labelTe: 'వరి', labelHi: 'धान', labelMr: 'तांदूळ', category: 'cereals', unit: 'kg', typicalYieldText: 'Grade A Quality', icon: '🌾' },
  { id: 'Cotton', labelEn: 'Cotton', labelTe: 'పత్తి', labelHi: 'कपास', labelMr: 'कापूस', category: 'commercial', unit: 'kg', typicalYieldText: 'Medium / Long staple', icon: '🌱' },
  { id: 'Chilli', labelEn: 'Chilli', labelTe: 'ఎండు మిరప', labelHi: 'सूखी लाल मिर्च', labelMr: 'सुक्या लाल मिरच्या', category: 'commercial', unit: 'kg', typicalYieldText: 'Premium spicy variety', icon: '🌶️' },
  { id: 'Maize', labelEn: 'Maize', labelTe: 'మొక్కజొన్న', labelHi: 'मक्का', labelMr: 'मका', category: 'cereals', unit: 'kg', typicalYieldText: 'Yellow feed grain', icon: '🌽' },
  { id: 'Onion', labelEn: 'Onion', labelTe: 'ఉల్లిపాయ', labelHi: 'प्याज़', labelMr: 'कांदा', category: 'vegetables', unit: 'kg', typicalYieldText: 'Red / White Onion', icon: '🧅' },
  { id: 'Potato', labelEn: 'Potato', labelTe: 'బంగాళాదుంప', labelHi: 'आलू', labelMr: 'बटाटा', category: 'vegetables', unit: 'kg', typicalYieldText: 'Table Potato', icon: '🥔' },
  { id: 'Soybean', labelEn: 'Soybean', labelTe: 'సోయాబీన్', labelHi: 'सोयाबीन', labelMr: 'सोयाबीन', category: 'oilseeds', unit: 'kg', typicalYieldText: 'Yellow Soybean', icon: '🫘' },
  { id: 'Wheat', labelEn: 'Wheat', labelTe: 'గోధుమ', labelHi: 'गेहूँ', labelMr: 'गहू', category: 'cereals', unit: 'kg', typicalYieldText: 'Milling Quality', icon: '🌾' },
  { id: 'Groundnut', labelEn: 'Groundnut', labelTe: 'వేరుశెనగ', labelHi: 'मूंगफली', labelMr: 'भुईमूग', category: 'oilseeds', unit: 'kg', typicalYieldText: 'In shell', icon: '🥜' },
  { id: 'Tur', labelEn: 'Tur (Pigeon Pea)', labelTe: 'కందులు', labelHi: 'अरहर', labelMr: 'तूर', category: 'pulses', unit: 'kg', typicalYieldText: 'Split / Whole', icon: '🫘' },
  { id: 'Gram', labelEn: 'Gram (Chickpea)', labelTe: 'శనగలు', labelHi: 'चना', labelMr: 'हरभरा', category: 'pulses', unit: 'kg', typicalYieldText: 'Desi / Kabuli', icon: '🫘' },
  { id: 'Grapes', labelEn: 'Grapes', labelTe: 'ద్రాక్ష', labelHi: 'अंगूर', labelMr: 'द्राक्षे', category: 'fruits', unit: 'kg', typicalYieldText: 'Fresh table grapes', icon: '🍇' },
  { id: 'Mango', labelEn: 'Mango', labelTe: 'మామిడి', labelHi: 'आम', labelMr: 'आंबा', category: 'fruits', unit: 'kg', typicalYieldText: 'Fresh fruit', icon: '🥭' },
  { id: 'Banana', labelEn: 'Banana', labelTe: 'అరటి', labelHi: 'केला', labelMr: 'केळी', category: 'fruits', unit: 'kg', typicalYieldText: 'Fresh fruit', icon: '🍌' },
  { id: 'Turmeric', labelEn: 'Turmeric', labelTe: 'పసుపు', labelHi: 'हल्दी', labelMr: 'हळद', category: 'commercial', unit: 'kg', typicalYieldText: 'High curcumin variety', icon: '🌿' },
  { id: 'Sugarcane', labelEn: 'Sugarcane', labelTe: 'చెరకు', labelHi: 'गन्ना', labelMr: 'ऊस', category: 'commercial', unit: 'kg', typicalYieldText: 'Cane crop', icon: '🎋' },
  { id: 'Jowar', labelEn: 'Jowar (Sorghum)', labelTe: 'జొన్నలు', labelHi: 'ज्वार', labelMr: 'ज्वारी', category: 'cereals', unit: 'kg', typicalYieldText: 'Millets grain', icon: '🌾' },
  { id: 'Bajra', labelEn: 'Bajra (Pearl Millet)', labelTe: 'సజ్జలు', labelHi: 'बाजरा', labelMr: 'बाजरी', category: 'cereals', unit: 'kg', typicalYieldText: 'Drought hardy grain', icon: '🌾' },
  { id: 'Ragi', labelEn: 'Ragi (Finger Millet)', labelTe: 'రాగులు', labelHi: 'रागी', labelMr: 'नाचणी', category: 'cereals', unit: 'kg', typicalYieldText: 'Nutritious millet', icon: '🌾' },
  { id: 'Barley', labelEn: 'Barley', labelTe: 'బార్లీ', labelHi: 'जौ', labelMr: 'जव', category: 'cereals', unit: 'kg', typicalYieldText: 'Feed & malting', icon: '🌾' },
  { id: 'Mustard', labelEn: 'Mustard', labelTe: 'ఆవాలు', labelHi: 'सरसों', labelMr: 'मोहरी', category: 'oilseeds', unit: 'kg', typicalYieldText: 'Oilseed grain', icon: '🌼' },
  { id: 'Sunflower', labelEn: 'Sunflower', labelTe: 'పొద్దుతిరుగుడు', labelHi: 'सूरजमुखी', labelMr: 'सूर्यफूल', category: 'oilseeds', unit: 'kg', typicalYieldText: 'Oilseed crop', icon: '🌻' },
  { id: 'Sesame', labelEn: 'Sesame', labelTe: 'నువ్వులు', labelHi: 'तिल', labelMr: 'तीळ', category: 'oilseeds', unit: 'kg', typicalYieldText: 'White / Black seeds', icon: '🫘' },
  { id: 'Moong', labelEn: 'Green Gram (Moong)', labelTe: 'పెసలు', labelHi: 'मूंग दाल', labelMr: 'मूग', category: 'pulses', unit: 'kg', typicalYieldText: 'Whole green pulse', icon: '🫘' },
  { id: 'Urad', labelEn: 'Black Gram (Urad)', labelTe: 'మినుములు', labelHi: 'उड़द दाल', labelMr: 'उडीद', category: 'pulses', unit: 'kg', typicalYieldText: 'Whole black pulse', icon: '🫘' },
  { id: 'Masoor', labelEn: 'Lentil (Masoor)', labelTe: 'ఎర్ర కందులు', labelHi: 'मसूर दाल', labelMr: 'मसूर', category: 'pulses', unit: 'kg', typicalYieldText: 'Red lentil pulse', icon: '🫘' },
  { id: 'Cabbage', labelEn: 'Cabbage', labelTe: 'క్యాబేజీ', labelHi: 'पत्तागोभी', labelMr: 'कोबी', category: 'vegetables', unit: 'kg', typicalYieldText: 'Fresh vegetable', icon: '🥬' },
  { id: 'Cauliflower', labelEn: 'Cauliflower', labelTe: 'క్యాలీఫ్లవర్', labelHi: 'फूलगोभी', labelMr: 'फ्लॉवर', category: 'vegetables', unit: 'kg', typicalYieldText: 'Fresh vegetable', icon: '🥦' },
  { id: 'Brinjal', labelEn: 'Brinjal (Eggplant)', labelTe: 'వంకాయ', labelHi: 'बैंगन', labelMr: 'वांगी', category: 'vegetables', unit: 'kg', typicalYieldText: 'Fresh vegetable', icon: '🍆' },
  { id: 'Okra', labelEn: 'Okra (Lady Finger)', labelTe: 'బెండకాయ', labelHi: 'भिंडी', labelMr: 'भेंडी', category: 'vegetables', unit: 'kg', typicalYieldText: 'Fresh vegetable', icon: '🥒' },
  { id: 'Carrot', labelEn: 'Carrot', labelTe: 'క్యారెట్', labelHi: 'गाजर', labelMr: 'गाजर', category: 'vegetables', unit: 'kg', typicalYieldText: 'Root vegetable', icon: '🥕' },
  { id: 'Garlic', labelEn: 'Garlic', labelTe: 'వెల్లుల్లి', labelHi: 'लहसुन', labelMr: 'लसूण', category: 'vegetables', unit: 'kg', typicalYieldText: 'Dry garlic bulbs', icon: '🧄' },
  { id: 'Ginger', labelEn: 'Ginger', labelTe: 'అల్లం', labelHi: 'अदरक', labelMr: 'आले', category: 'vegetables', unit: 'kg', typicalYieldText: 'Fresh ginger root', icon: '🫚' },
  { id: 'Apple', labelEn: 'Apple', labelTe: 'యాపిల్', labelHi: 'सेब', labelMr: 'सफरचंद', category: 'fruits', unit: 'kg', typicalYieldText: 'Grade A fresh fruit', icon: '🍎' },
  { id: 'Orange', labelEn: 'Orange', labelTe: 'నారింజ / బత్తాయి', labelHi: 'संतरा', labelMr: 'संत्री', category: 'fruits', unit: 'kg', typicalYieldText: 'Citrus sweet orange', icon: '🍊' },
];
