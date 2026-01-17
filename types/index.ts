export interface Product {
  id: string;
  producto: string;
  valorEnCarta: number;
  numero: number;
  comensalId: string;
  comensalName?: string;
  addedByVaquero?: boolean; // Indica si el producto fue agregado por el vaquero
  distributionGroupId?: string; // ID de grupo para productos distribuidos entre todos los comensales
  addedAt: Date;
}

export interface Vaca {
  id: string;
  name: string;
  createdAt: Date;
  vaqueroId: string;
  vaqueroName?: string; // Nombre del vaquero
  products: Product[];
  paymentQRCode?: string; // Base64 encoded image or URL
  brebKey?: string; // Llave de Bre-B (sistema bancario colombiano)
  restaurantBillTotal?: number; // Valor total de la cuenta del restaurante
  tipPercent?: number; // Porcentaje de propina (por defecto 10)
  isActive: boolean;
}

export interface Comensal {
  id: string;
  name: string;
  vacaId: string;
  joinedAt: Date;
  mergedIntoId?: string; // Si existe, esta cuenta fue fusionada con otro comensal
  mergedAt?: Date;
}

export interface Payment {
  id: string;
  vacaId: string;
  comensalId: string;
  consignadorName: string; // Nombre de quién consigna
  amount: number;
  paidAt: Date;
}

