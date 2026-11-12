import React, { createContext, useContext, useEffect, useState } from "react";

interface Brand {
  id: string;
  name: string;
  created_at?: string;
}

interface BrandContextType {
  brands: Brand[];
  activeBrand: Brand | null;
  setActiveBrand: (brand: Brand | null) => void;
  loadingBrands: boolean;
  refreshBrands: (preferredBrandId?: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export const BrandProvider = ({ children }: { children: React.ReactNode }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const refreshBrands = async (preferredBrandId?: string) => {
    setLoadingBrands(true);
    try {
      const res = await fetch(`${SERVER_URL}/brands`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data: Brand[] = await res.json();
      if (Array.isArray(data)) {
        setBrands(data);

        if (preferredBrandId) {
          const activeBrandFromJson =
            data.find((brand) => brand.id === preferredBrandId) ?? null;

          setActiveBrand(activeBrandFromJson);
        } else {
          setActiveBrand((prev) => {
            if (prev) {
              const stillExists = data.find((b) => b.id === prev?.id);
              if (stillExists) return stillExists;
            }
            return data[0] ?? null;
          });
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch brands", error?.message);
    } finally {
      setLoadingBrands(false);
    }
  };

  useEffect(() => {
    refreshBrands();
  }, []);

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        setActiveBrand,
        loadingBrands,
        refreshBrands,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    throw new Error("useBrand must be used inside a BrandProvider");
  }
  return ctx;
};
