using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class Product
    {
        public Product()
        {
            PurchaseDetail = new List<PurchaseDetails>();
            StockMasters = new List<StockMaster>();
        }
        public ICollection<PurchaseDetails> PurchaseDetail { get; set; }
        public ICollection<StockMaster> StockMasters { get; set; }

        public int Id { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public virtual Brand? Brand { get; set; }
        public int BrandId {  get; set; }

        public virtual Category? Category { get; set; }
        public int CategoryId { get; set; }  // Shirt, Jeans, T-Shirt

        public string Size { get; set; } = string.Empty;       // S, M, L, XL

        public string Color { get; set; } = string.Empty;

        public string Fabric { get; set; } = string.Empty;     // Cotton, Denim, Linen

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }
    }

}
