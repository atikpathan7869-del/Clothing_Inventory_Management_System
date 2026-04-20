using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace BusinessLayer.Models
{
    public class StockMaster
    {

        public StockMaster()
        {
            ReciptItems = new HashSet<ReciptItem>();
            SalesReturn_Item = new HashSet<SalesReturn_Item>();
            OutWardItem = new HashSet<OutWardItem>();
        }
        public virtual ICollection<ReciptItem> ReciptItems { get; set; }
        public virtual ICollection<SalesReturn_Item> SalesReturn_Item { get; set; }
        public virtual ICollection<OutWardItem> OutWardItem { get; set; }
        public int Id { get; set; }

        // 🔗 Purchase Details Relation
        public int? PurchaseId { get; set; }

        public virtual Purchase? purchase { get; set; }

        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }


        // 🔗 Staff Relation (Who handled stock)
        public int StaffMasterId { get; set; }
        public virtual StaffMaster? StaffMaster { get; set; }

        // 📦 Product Attributes
        public string Size { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;

        public int Qty { get; set; } 
        // 💰 Pricing
        public decimal RateGST { get; set; }     // GST percentage or GST rate
        public decimal SalePrice { get; set; }
        public decimal CostPrice { get; set; }

        // 📅 Stock Entry Date
        public DateTime InwardDate { get; set; }

        // 🏷 Identification
        public string StockCode { get; set; } = string.Empty;
        public string Barcode { get; set; } = string.Empty;

        // 🕒 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}