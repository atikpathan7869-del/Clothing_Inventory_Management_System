using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class ReciptItem
    {
        public ReciptItem()
        {
            SalesReturn_Item = new HashSet<SalesReturn_Item>();
        }
        public virtual ICollection<SalesReturn_Item> SalesReturn_Item { get; set; }

        public int Id { get; set; }

        // 🔹 Foreign Keys
        public int StockMasterId { get; set; }
        public virtual StockMaster? StockMaster { get; set; }

        public int ReciptMasterId { get; set; }
        public virtual ReciptMaster? ReciptMaster { get; set; }

        // 🔹 Sale Details
        public decimal Rate { get; set; }              // Per piece rate
        public int Qty { get; set; }                   // Quantity

        public decimal Amount { get; set; }            // Rate * Qty

        // 🔹 Discount
        public decimal DiscountPer { get; set; }       // Discount %
        public decimal DiscountAmount { get; set; }    // Calculated discount

        // 🔹 GST
        public decimal GSTPer { get; set; }            // GST %
        public decimal GSTAmount { get; set; }         // GST calculated

        // 🔹 Final
        public decimal Total { get; set; }             // Final amount after discount + GST

        // 🔹 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
