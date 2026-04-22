export default function invoiceHTML({ shop, bill }: any) {
  const items = Array.isArray(bill.items) ? bill.items : [];

  const subtotal = Number(bill.totalAmount || 0);
  const discount = Number(bill.discount || 0);

  const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
  const logoUrl = `${BASE_URL}/static/Shop.jpg`;

  const rows = items.map((it: any, i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td>${it.name}</td>
      <td>${it.qty}</td>
      <td>₹${it.price}</td>
      <td>₹${it.price * it.qty}</td>
    </tr>
  `).join("");

  return `
  <html>
  <head>
    <style>
      body { font-family: Arial; margin: 0; }
      .container {
        width: 800px;
        margin: auto;
        border: 5px solid gold;
        padding: 20px;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid gold;
      }
      .header img { width: 120px; }
      h1 { color: maroon; }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }

      th {
        background: maroon;
        color: gold;
      }

      td, th {
        border: 1px solid #ddd;
        padding: 6px;
        font-size: 12px;
      }

      .right { text-align: right; }

      .total {
        text-align: right;
        margin-top: 15px;
      }

      .net {
        font-size: 18px;
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <div class="header">
        <img src="${logoUrl}" />
        <h1>Sohan Lal & Sons Jewellers</h1>
        <div>GSTIN: ${shop.gst}</div>
      </div>

      <div style="display:flex; justify-content:space-between;">
        <div>
          Invoice: ${bill.invoiceNo}<br/>
          Date: ${new Date(bill.created_at).toLocaleString()}
        </div>

        <div>
          Customer: ${bill.customerName}<br/>
          Phone: ${bill.customerPhone}
        </div>
      </div>

      <table>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Amount</th>
        </tr>
        ${rows}
      </table>

      <div class="total">
        <div>Subtotal: ₹${subtotal}</div>
        <div>Discount: ₹${discount}</div>
        <div>GST: ₹${bill.gstAmount}</div>
        <div class="net">Net: ₹${bill.netAmount}</div>
      </div>

    </div>
  </body>
  </html>
  `;
}