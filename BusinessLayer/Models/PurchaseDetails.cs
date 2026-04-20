using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    using System;
    using System.ComponentModel.DataAnnotations.Schema;

    public class PurchaseDetails
    {
        public PurchaseDetails()
        {
            StockMasters = new HashSet<StockMaster>();
        }

        public ICollection<StockMaster> StockMasters { get; set; }
        public int Id { get; set; }

        // 🔹 Product Relation
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        // 🔹 Purchase Relation
        public int PurchaseId { get; set; }
        public virtual Purchase? Purchase { get; set; }


        // 🔹 Quantity & Pricing
        public decimal Qty { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        // 🔹 NEW FIELDS
        public string Size { get; set; } = "";
        public string Color { get; set; } = "";

        // 🔹 Amount Calculation
        public decimal GrossAmt { get; set; }      // Qty * CostPrice
        public string? GstType { get; set; }       // Inclusive / Exclusive
        public decimal GstPer { get; set; }        // GST Percentage
        public decimal GstAmt { get; set; }        // GST Amount
        public decimal Total { get; set; }         // Final Amount

        // 🔹 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
