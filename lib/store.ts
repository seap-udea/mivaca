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

  createVaca(name: string, vaqueroId: string, vaqueroName?: string): Vaca {
    const vaca: Vaca = {
      id: uuidv4(),
      name,
      createdAt: new Date(),
      vaqueroId,
      vaqueroName,
      products: [],
      tipPercent: 10,
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

  setBreBKey(vacaId: string, brebKey: string): void {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      throw new Error('Vaca not found');
    }
    if (brebKey.trim() === '') {
      delete vaca.brebKey;
    } else {
      vaca.brebKey = brebKey;
    }
    this.vacas.set(vacaId, vaca);
  }

  setRestaurantBillTotal(vacaId: string, total: number): void {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      throw new Error('Vaca not found');
    }
    vaca.restaurantBillTotal = total;
    this.vacas.set(vacaId, vaca);
  }

  setTipPercent(vacaId: string, tipPercent: number): void {
    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      throw new Error('Vaca not found');
    }
    const normalized = Number(tipPercent);
    if (!isFinite(normalized) || normalized < 0 || normalized > 100) {
      throw new Error('Invalid tip percent');
    }
    vaca.tipPercent = normalized;
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
    const tipRate = (vaca.tipPercent ?? 10) / 100;
    const tip = subtotal * tipRate;
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

  mergeComensalAccounts(vacaId: string, fromComensalId: string, toComensalId: string): void {
    if (fromComensalId === toComensalId) {
      throw new Error('Cannot merge a comensal into itself');
    }

    const vaca = this.vacas.get(vacaId);
    if (!vaca) {
      throw new Error('Vaca not found');
    }

    const from = this.comensales.get(fromComensalId);
    const to = this.comensales.get(toComensalId);
    if (!from || !to) {
      throw new Error('Comensal not found');
    }
    if (from.vacaId !== vacaId || to.vacaId !== vacaId) {
      throw new Error('Comensales must belong to the same vaca');
    }
    if (from.mergedIntoId) {
      throw new Error('Source comensal is already merged');
    }
    if (to.mergedIntoId) {
      throw new Error('Target comensal is merged and cannot receive accounts');
    }

    // Move products
    vaca.products = vaca.products.map((p) => {
      if (p.comensalId !== fromComensalId) return p;
      return {
        ...p,
        comensalId: toComensalId,
        comensalName: to.name,
      };
    });
    this.vacas.set(vacaId, vaca);

    // Mark source as merged
    from.mergedIntoId = toComensalId;
    from.mergedAt = new Date();
    this.comensales.set(fromComensalId, from);
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
  if (!globalThis.__vacaStore || 
      typeof globalThis.__vacaStore.addPayment !== 'function' ||
      typeof globalThis.__vacaStore.setBreBKey !== 'function' ||
      typeof globalThis.__vacaStore.setRestaurantBillTotal !== 'function' ||
      typeof globalThis.__vacaStore.setTipPercent !== 'function' ||
      typeof globalThis.__vacaStore.mergeComensalAccounts !== 'function') {
    globalThis.__vacaStore = new VacaStore();
  }
  storeInstance = globalThis.__vacaStore;
} else {
  // In production, create a new instance
  storeInstance = new VacaStore();
}

export const store = storeInstance;

