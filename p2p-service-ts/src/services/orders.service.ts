import { dbService } from '@/database';
import { Order } from '@/interfaces/orders.interface';
import { Provider } from '@/interfaces/providers.interface';

export class OrderService {
  public saveOrder(
    pixAddress: Order['merchant'],
    amount: Order['amount'],
    usdtAmount: Order['usdt_amount'],
    status: Order['status'],
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const query =
        'INSERT INTO orders (merchant, amount, usdt_amount, status) VALUES (?, ?, ?, ?)';
      dbService.db.run(query, [pixAddress, amount, usdtAmount, status], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  public getOrderById(orderId: Order['id']): Promise<Order> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders WHERE id = ?';
      dbService.db.get(query, [orderId], (err, row: Order) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  public updateOrder(
    orderId: Order['id'],
    status: Order['status'],
    providerId?: Provider['id'],
    receiptImage?: Order['receipt_image'],
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE orders SET provider_id = ?, receipt_image = ?, status = ? WHERE id = ?';
      dbService.db.run(query, [providerId, receiptImage, status, orderId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
}
