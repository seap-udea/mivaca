export interface Product {
  id: string;
  producto: string;
  valorEnCarta: number;
  numero: number;
  comensalId: string;
  comensalName?: string;
  addedAt: Date;
}

export interface Vaca {
  id: string;
  name: string;
  createdAt: Date;
  vaqueroId: string;
  products: Product[];
  paymentQRCode?: string; // Base64 encoded image or URL
  isActive: boolean;
}

export interface Comensal {
  id: string;
  name: string;
  vacaId: string;
  joinedAt: Date;
}

export interface Payment {
  id: string;
  vacaId: string;
  comensalId: string;
  consignadorName: string; // Nombre de quién consigna
  amount: number;
  paidAt: Date;
}

