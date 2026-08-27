-- AlterTable: products jadvaliga yangi ustunlar qo'shish
-- ingredients: Tarkibi va masalliqlar
-- storageConditions: Saqlash sharoiti  
-- deliveryTerms: Yetkazib berish shartlari

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "ingredients" TEXT,
  ADD COLUMN IF NOT EXISTS "storageConditions" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryTerms" TEXT;
