// Pantone color database subset - common fashion/design colors
// Note: These are approximations as actual Pantone colors are proprietary

import type { RGB } from './color';

export interface PantoneColor {
  code: string;
  name: string;
  hex: string;
  rgb: RGB;
}

// Popular Pantone colors for fashion and design
export const PANTONE_COLORS: PantoneColor[] = [
  // Neutrals
  { code: '11-0601', name: 'Bright White', hex: '#F4F5F0', rgb: { r: 244, g: 245, b: 240 } },
  { code: '11-4800', name: 'Blanc de Blanc', hex: '#E8E4DB', rgb: { r: 232, g: 228, b: 219 } },
  { code: '13-0907', name: 'Pale Cream', hex: '#F2E6D9', rgb: { r: 242, g: 230, b: 217 } },
  { code: '14-4002', name: 'Silver', hex: '#C0C0C0', rgb: { r: 192, g: 192, b: 192 } },
  { code: '17-1501', name: 'Steeple Gray', hex: '#7A7A7A', rgb: { r: 122, g: 122, b: 122 } },
  { code: '19-4005', name: 'Black', hex: '#2D2D2D', rgb: { r: 45, g: 45, b: 45 } },

  // Reds
  { code: '17-1563', name: 'Cherry Tomato', hex: '#E94B3C', rgb: { r: 233, g: 75, b: 60 } },
  { code: '18-1663', name: 'Fiery Red', hex: '#D0312D', rgb: { r: 208, g: 49, b: 45 } },
  { code: '19-1664', name: 'True Red', hex: '#BF1932', rgb: { r: 191, g: 25, b: 50 } },
  { code: '18-1750', name: 'Viva Magenta', hex: '#BE3455', rgb: { r: 190, g: 52, b: 85 } },
  { code: '17-1937', name: 'Hot Pink', hex: '#E55B3C', rgb: { r: 229, g: 91, b: 60 } },
  { code: '18-1654', name: 'Poppy Red', hex: '#DC343B', rgb: { r: 220, g: 52, b: 59 } },

  // Pinks
  { code: '13-2010', name: 'Crystal Rose', hex: '#F4C2C2', rgb: { r: 244, g: 194, b: 194 } },
  { code: '14-1911', name: 'Powder Pink', hex: '#EBBEB3', rgb: { r: 235, g: 190, b: 179 } },
  { code: '15-1920', name: 'Flamingo Pink', hex: '#F4A7B9', rgb: { r: 244, g: 167, b: 185 } },
  { code: '17-2127', name: 'Fuchsia Rose', hex: '#C74375', rgb: { r: 199, g: 67, b: 117 } },
  { code: '18-2436', name: 'Pink Peacock', hex: '#C62168', rgb: { r: 198, g: 33, b: 104 } },
  { code: '16-1723', name: 'Bubblegum', hex: '#EFA6AA', rgb: { r: 239, g: 166, b: 170 } },

  // Oranges
  { code: '16-1546', name: 'Living Coral', hex: '#FF6F61', rgb: { r: 255, g: 111, b: 97 } },
  { code: '16-1359', name: 'Orange Peel', hex: '#FA7A35', rgb: { r: 250, g: 122, b: 53 } },
  { code: '15-1247', name: 'Apricot Cream', hex: '#F5B895', rgb: { r: 245, g: 184, b: 149 } },
  { code: '17-1350', name: 'Autumn Maple', hex: '#C66B3D', rgb: { r: 198, g: 107, b: 61 } },
  { code: '16-1449', name: 'Mango', hex: '#FF8243', rgb: { r: 255, g: 130, b: 67 } },
  { code: '15-1340', name: 'Peach Cobbler', hex: '#FF9966', rgb: { r: 255, g: 153, b: 102 } },

  // Yellows
  { code: '12-0752', name: 'Buttercup', hex: '#FAE03C', rgb: { r: 250, g: 224, b: 60 } },
  { code: '13-0858', name: 'Vibrant Yellow', hex: '#FFDA29', rgb: { r: 255, g: 218, b: 41 } },
  { code: '14-0756', name: 'Empire Yellow', hex: '#F9D857', rgb: { r: 249, g: 216, b: 87 } },
  { code: '12-0824', name: 'Pale Banana', hex: '#FAE199', rgb: { r: 250, g: 225, b: 153 } },
  { code: '13-0947', name: 'Illuminating', hex: '#F5DF4D', rgb: { r: 245, g: 223, b: 77 } },
  { code: '14-0951', name: 'Golden Rod', hex: '#D2A826', rgb: { r: 210, g: 168, b: 38 } },

  // Greens
  { code: '15-5519', name: 'Turquoise', hex: '#45B5AA', rgb: { r: 69, g: 181, b: 170 } },
  { code: '16-5938', name: 'Arcadia', hex: '#00A170', rgb: { r: 0, g: 161, b: 112 } },
  { code: '17-5641', name: 'Emerald', hex: '#009473', rgb: { r: 0, g: 148, b: 115 } },
  { code: '15-0343', name: 'Greenery', hex: '#88B04B', rgb: { r: 136, g: 176, b: 75 } },
  { code: '18-0107', name: 'Kale', hex: '#5A7247', rgb: { r: 90, g: 114, b: 71 } },
  { code: '16-0230', name: 'Jade Green', hex: '#00A86B', rgb: { r: 0, g: 168, b: 107 } },
  { code: '13-0442', name: 'Lime Green', hex: '#C4D600', rgb: { r: 196, g: 214, b: 0 } },
  { code: '17-5104', name: 'Ultimate Gray', hex: '#939597', rgb: { r: 147, g: 149, b: 151 } },

  // Blues
  { code: '19-4052', name: 'Classic Blue', hex: '#0F4C81', rgb: { r: 15, g: 76, b: 129 } },
  { code: '17-4041', name: 'Serenity', hex: '#92A8D1', rgb: { r: 146, g: 168, b: 209 } },
  { code: '15-4020', name: 'Cerulean', hex: '#9BB7D4', rgb: { r: 155, g: 183, b: 212 } },
  { code: '18-4051', name: 'Snorkel Blue', hex: '#034F84', rgb: { r: 3, g: 79, b: 132 } },
  { code: '19-4150', name: 'Skydiver', hex: '#00539C', rgb: { r: 0, g: 83, b: 156 } },
  { code: '16-4132', name: 'Aquamarine', hex: '#7BC4C4', rgb: { r: 123, g: 196, b: 196 } },
  { code: '17-4123', name: 'Niagara', hex: '#5487A4', rgb: { r: 84, g: 135, b: 164 } },
  { code: '19-4030', name: 'Navy Blue', hex: '#2C4E74', rgb: { r: 44, g: 78, b: 116 } },

  // Purples
  { code: '18-3838', name: 'Ultra Violet', hex: '#5F4B8B', rgb: { r: 95, g: 75, b: 139 } },
  { code: '17-3938', name: 'Very Peri', hex: '#6667AB', rgb: { r: 102, g: 103, b: 171 } },
  { code: '18-3224', name: 'Radiant Orchid', hex: '#B163A3', rgb: { r: 177, g: 99, b: 163 } },
  { code: '19-3528', name: 'Peach Blossom', hex: '#8E4585', rgb: { r: 142, g: 69, b: 133 } },
  { code: '16-3815', name: 'Orchid Bloom', hex: '#9F7D9E', rgb: { r: 159, g: 125, b: 158 } },
  { code: '19-3748', name: 'Grape Compote', hex: '#6B5876', rgb: { r: 107, g: 88, b: 118 } },
  { code: '15-3817', name: 'Lavender', hex: '#B8A9C9', rgb: { r: 184, g: 169, b: 201 } },

  // Browns & Tans
  { code: '19-1314', name: 'Chestnut', hex: '#9B4722', rgb: { r: 155, g: 71, b: 34 } },
  { code: '18-1244', name: 'Potters Clay', hex: '#9E5B40', rgb: { r: 158, g: 91, b: 64 } },
  { code: '17-1340', name: 'Adobe', hex: '#BD6C48', rgb: { r: 189, g: 108, b: 72 } },
  { code: '16-1318', name: 'Toasted Almond', hex: '#D2B49C', rgb: { r: 210, g: 180, b: 156 } },
  { code: '15-1220', name: 'Almond Buff', hex: '#D1B894', rgb: { r: 209, g: 184, b: 148 } },
  { code: '17-1327', name: 'Tobacco Brown', hex: '#8C6B4F', rgb: { r: 140, g: 107, b: 79 } },
  { code: '19-1118', name: 'Chocolate Brown', hex: '#3D291D', rgb: { r: 61, g: 41, b: 29 } },
  { code: '14-1213', name: 'Hazelnut', hex: '#C6A280', rgb: { r: 198, g: 162, b: 128 } },

  // Earth Tones
  { code: '18-1048', name: 'Caramel Cafe', hex: '#8A5A3C', rgb: { r: 138, g: 90, b: 60 } },
  { code: '17-1320', name: 'Tannin', hex: '#A67C52', rgb: { r: 166, g: 124, b: 82 } },
  { code: '16-1412', name: 'Warm Taupe', hex: '#A69279', rgb: { r: 166, g: 146, b: 121 } },
  { code: '17-0627', name: 'Olive Green', hex: '#708238', rgb: { r: 112, g: 130, b: 56 } },
  { code: '19-0515', name: 'Moss', hex: '#575D3B', rgb: { r: 87, g: 93, b: 59 } },
  { code: '18-0950', name: 'Mustard', hex: '#CF9F5D', rgb: { r: 207, g: 159, b: 93 } },

  // Metallics (approximations)
  { code: '16-1324', name: 'Gold', hex: '#D4AF37', rgb: { r: 212, g: 175, b: 55 } },
  { code: '17-1518', name: 'Rose Gold', hex: '#B76E79', rgb: { r: 183, g: 110, b: 121 } },
  { code: '14-5002', name: 'Silver Birch', hex: '#AEA8A3', rgb: { r: 174, g: 168, b: 163 } },
  { code: '19-3803', name: 'Gunmetal', hex: '#53565A', rgb: { r: 83, g: 86, b: 90 } },
  { code: '18-1242', name: 'Bronze', hex: '#9C6644', rgb: { r: 156, g: 102, b: 68 } },
  { code: '17-1230', name: 'Copper', hex: '#B87333', rgb: { r: 184, g: 115, b: 51 } },
];

// Find closest Pantone color by Euclidean distance in RGB space
export function findClosestPantone(rgb: RGB): PantoneColor & { distance: number } {
  let closest = PANTONE_COLORS[0];
  let minDistance = Infinity;

  for (const pantone of PANTONE_COLORS) {
    const distance = Math.sqrt(
      Math.pow(rgb.r - pantone.rgb.r, 2) +
      Math.pow(rgb.g - pantone.rgb.g, 2) +
      Math.pow(rgb.b - pantone.rgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closest = pantone;
    }
  }

  return { ...closest, distance: minDistance };
}

// Find multiple closest Pantone colors
export function findClosestPantones(rgb: RGB, count: number = 5): (PantoneColor & { distance: number })[] {
  const withDistances = PANTONE_COLORS.map(pantone => ({
    ...pantone,
    distance: Math.sqrt(
      Math.pow(rgb.r - pantone.rgb.r, 2) +
      Math.pow(rgb.g - pantone.rgb.g, 2) +
      Math.pow(rgb.b - pantone.rgb.b, 2)
    ),
  }));

  return withDistances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

// Search Pantone colors by name or code
export function searchPantone(query: string): PantoneColor[] {
  const lowerQuery = query.toLowerCase();
  return PANTONE_COLORS.filter(
    color =>
      color.name.toLowerCase().includes(lowerQuery) ||
      color.code.toLowerCase().includes(lowerQuery)
  );
}

// Get Pantone color by code
export function getPantoneByCode(code: string): PantoneColor | undefined {
  return PANTONE_COLORS.find(color => color.code === code);
}
