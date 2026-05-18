/**
 * Icecat Open Catalog integration
 * Free registration: https://icecat.us/user/register.html
 * Docs: https://icecat.us/developer/
 *
 * Używa Basic Auth: ICECAT_USERNAME + ICECAT_PASSWORD z .env
 * Pobiera dane produktów i uzupełnia Brand w bazie.
 */
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { CategoryType } from '@prisma/client';

const BASE_URL = 'https://icecat.us/api';

function getAuth() {
  const user = process.env.ICECAT_USERNAME;
  const pass = process.env.ICECAT_PASSWORD;
  if (!user || !pass) throw new Error('ICECAT_USERNAME / ICECAT_PASSWORD not set in .env');
  return { username: user, password: pass };
}

interface IcecatSupplier {
  ID: number;
  Name: string;
  LogoPic?: string;
}

interface IcecatSuppliersResponse {
  SuppliersList?: IcecatSupplier[];
}

interface IcecatCategoryFeature {
  CategoryFeatureGroup_ID: number;
  Feature: { Measure?: { Signs?: { Sign?: { Value?: string }[] } } };
}

interface IcecatProduct {
  Prod_ID: string;
  Name: string;
  Brand: string;
  BrandID: number;
  Category?: { Name?: { Value?: string } };
  CategoryFeaturesList?: IcecatCategoryFeature[];
}

interface IcecatProductResponse {
  data?: IcecatProduct;
}

// Mapowanie kategorii Icecat → CategoryType Selltry
const ICECAT_CAT_MAP: Record<string, CategoryType> = {
  'Mobile Phones': CategoryType.ELECTRONICS,
  'Laptops': CategoryType.ELECTRONICS,
  'Tablets': CategoryType.ELECTRONICS,
  'Headphones': CategoryType.ELECTRONICS,
  'Cameras': CategoryType.ELECTRONICS,
  'TVs': CategoryType.ELECTRONICS,
  'Audio Systems': CategoryType.ELECTRONICS,
  'Game Consoles': CategoryType.ELECTRONICS,
  'Printers': CategoryType.ELECTRONICS,
  'Monitors': CategoryType.ELECTRONICS,
  'Clothing': CategoryType.FASHION,
  'Footwear': CategoryType.FASHION,
  'Sports Equipment': CategoryType.SPORT,
  'Bicycles': CategoryType.SPORT,
  'Power Tools': CategoryType.TOOLS,
  'Hand Tools': CategoryType.TOOLS,
  'Household Appliances': CategoryType.HOME_GARDEN,
  'Kitchen Appliances': CategoryType.HOME_GARDEN,
};

function mapIcecatCategory(catName: string): CategoryType {
  for (const [key, type] of Object.entries(ICECAT_CAT_MAP)) {
    if (catName.toLowerCase().includes(key.toLowerCase())) return type;
  }
  return CategoryType.ELECTRONICS;
}

export async function syncIcecatBrands(): Promise<{ upserted: number }> {
  const auth = getAuth();

  const response = await axios.get<IcecatSuppliersResponse>(
    `${BASE_URL}/suppliers`,
    { auth, params: { format: 'JSON', lang: 'PL' } },
  );

  const suppliers = response.data?.SuppliersList ?? [];
  let upserted = 0;

  // Podziel na batche po 50 żeby nie przeciążać DB
  const BATCH = 50;
  for (let i = 0; i < suppliers.length; i += BATCH) {
    const batch = suppliers.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (supplier) => {
        await prisma.brand.upsert({
          where: { name: supplier.Name },
          update: {},
          create: {
            name: supplier.Name,
            // Domyślnie Electronics — można rozszerzyć o categoryTypes z Icecat
            categoryTypes: [CategoryType.ELECTRONICS],
          },
        });
        upserted++;
      }),
    );
  }

  return { upserted };
}

export async function fetchIcecatProduct(
  brandName: string,
  productCode: string,
  lang = 'PL',
): Promise<IcecatProduct | null> {
  const auth = getAuth();
  try {
    const response = await axios.get<IcecatProductResponse>(
      `${BASE_URL}/product`,
      {
        auth,
        params: {
          Brand: brandName,
          ProductCode: productCode,
          lang,
          format: 'JSON',
        },
      },
    );
    return response.data?.data ?? null;
  } catch {
    return null;
  }
}

export function isIcecatConfigured(): boolean {
  return !!(process.env.ICECAT_USERNAME && process.env.ICECAT_PASSWORD);
}
