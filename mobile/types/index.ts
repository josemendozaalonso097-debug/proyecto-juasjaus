export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'estudiante' | 'maestro' | 'admin';
  semestre?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
}

export interface Compra {
  id: number;
  fecha: string;
  total: number;
  productos: Producto[];
  metodo_pago: string;
}
