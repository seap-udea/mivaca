import { Vaca, Product, Comensal, Payment } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Global store to persist across hot reloads in development
declare global {
  var __vacaStore: VacaStore | undefined;
}

// Simple in-memory store (can be replaced with a database later)
class VacaStore {
  private vacas: Map<string, Vaca> = new Map();
  private comensales: Map<string, Comensal> = new Map();
  private payments: Map<string, Payment> = new Map();

  createVaca(name: string, vaqueroId: string): Vaca {
    const vaca: Vaca = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      vaqueroId,
      products: [],
      isActive: true,
    };
    this.vacas.set(vaca.id, vaca);
    return vaca;
  }

  getVaca(id: string): Vaca | undefined {
    return this.vacas.get(id);
  }

  addProduct(vacaId: string, product: Omit<Product, 'id' | 'addedAt'>): Product {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      throw new Error('Vaca not found');
    }

    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      addedAt: new Date(),
    };

    vaca.products.push(newProduct);
    this.vacas.set(vacaId, vaca);
    return newProduct;
  }

  removeProduct(vacaId: string, productId: string, comensalId: string): boolean {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      return false;
    }

    const productIndex = vaca.products.findIndex(
      (p) => p.id === productId && p.comensalId === comensalId
    );

    if (productIndex === -1) {
      return false;
    }

    vaca.products.splice(productIndex, 1);
    this.vacas.set(vacaId, vaca);
    return true;
  }

  addComensal(vacaId: string, name: string): Comensal {
    const comensal: Comensal = {
      id: uuidv4(),
      name,
      vacaId,
      joinedAt: new Date(),
    };
    this.comensales.set(comensal.id, comensal);
    return comensal;
  }

  getComensal(id: string): Comensal | undefined {
    return this.comensales.get(id);
  }

  setPaymentQRCode(vacaId: string, qrCode: string): void {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      throw new Error('Vaca not found');
    }
    vaca.paymentQRCode = qrCode;
    this.vacas.set(vacaId, vaca);
  }

  calculateTotal(vacaId: string): number {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      return 0;
    }
    const subtotal = vaca.products.reduce(
      (sum, product) => sum + product.valorEnCarta * product.numero,
      0
    );
    const tip = subtotal * 0.1;
    return subtotal + tip;
  }

  getVacasByVaquero(vaqueroId: string): Vaca[] {
    return Array.from(this.vacas.values()).filter(
      (vaca) => vaca.vaqueroId === vaqueroId
    );
  }

  getComensalesByVaca(vacaId: string): Comensal[] {
    return Array.from(this.comensales.values()).filter(
      (comensal) => comensal.vacaId === vacaId
    );
  }

  addPayment(vacaId: string, comensalId: string, consignadorName: string, amount: number): Payment {
    const payment: Payment = {
      id: uuidv4(),
      vacaId,
      comensalId,
      consignadorName,
      amount,
      paidAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  getPaymentsByVaca(vacaId: string): Payment[] {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.vacaId === vacaId
    );
  }

  getTotalCollected(vacaId: string): number {
    return this.getPaymentsByVaca(vacaId).reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
  }
}

// Singleton instance that persists across hot reloads
let storeInstance: VacaStore;

if (process.env.NODE_ENV !== 'production') {
  // In development, use global to persist across hot reloads
  // But recreate if methods are missing (hot reload issue)
  if (!globalThis.__vacaStore || typeof globalThis.__vacaStore.addPayment !== 'function') {
    globalThis.__vacaStore = new VacaStore();
  }
  storeInstance = globalThis.__vacaStore;
} else {
  // In production, create a new instance
  storeInstance = new VacaStore();
}

export const store = storeInstance;

