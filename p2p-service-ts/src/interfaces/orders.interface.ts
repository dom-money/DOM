export interface Order {
  id: number;
  merchant: string;
  amount: number;
  usdt_amount: number;
  provider_id?: number;
  receipt_image?: string;
  status: string;
}
