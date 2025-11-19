export interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
      rate: number;
      count: number;
    };
  }
  
  export interface CartItem {
    product: Product;
    quantity: number;
  }
  
  export interface User {
    id: number;
    email: string;
    username: string;
    token?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message?: string;
  }