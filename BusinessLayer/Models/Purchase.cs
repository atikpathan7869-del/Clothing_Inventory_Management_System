using System;
using System.Collections.Generic;

namespace BusinessLayer.Models
{
    public class Purchase
    {
        public Purchase()
        {
            PurchasePayments = new List<PurchasePayment>();
            PurchaseDetail = new List<PurchaseDetails>();
        }

        public int Id { get; set; }

        public ICollection<PurchasePayment> PurchasePayments { get; set; }
        public ICollection<PurchaseDetails> PurchaseDetail { get; set; }

        public int VendorId { get; set; }
        public virtual Vendor? Vendor { get; set; }

        public string? PurchaseName { get; set; }
        public string? EWayBillNo { get; set; }
        public string BillNo { get; set; } = string.Empty;

        public DateTime BillDate { get; set; }
        public DateTime? DueDate { get; set; }

        public string GSTType { get; set; } = string.Empty;

        public decimal GrossAmount { get; set; }
        public decimal GSTAmount { get; set; }
        public decimal NetAmount { get; set; }

        public string? Remark { get; set; }
        public string? DocName { get; set; }
        public string? DocUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;

        public int FinancialYearId { get; set; }
        public virtual Financial_year? FinancialYear { get; set; }
    }
}