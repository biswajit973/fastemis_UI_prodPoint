export interface DeviceStock {
  id: number;
  device_code: string;
  category: string;
  category_label: string;
  brand: string;
  model: string;
  variant: string;
  color: string;
  device_type: string;
  price: number;
  discount_percent: number;
  discounted_price: number;
  in_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicStocksResponse {
  stocks: DeviceStock[];
  count: number;
  discount_percent: number;
}

export interface AgentStocksResponse {
  stocks: DeviceStock[];
  count: number;
  active_count: number;
  in_stock_count: number;
}
