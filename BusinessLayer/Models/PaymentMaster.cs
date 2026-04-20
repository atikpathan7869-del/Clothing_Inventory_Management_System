using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class PaymentMaster
    {
        public PaymentMaster()
        {
            PurchasePayments = new List<PurchasePayment>();
        }
    
        public int Id { get; set; }

        public ICollection<PurchasePayment> PurchasePayments { get; set; }
        public int VendorId { get; set; }
        public virtual Vendor? Vendor { get; set; }

        public decimal Amount { get; set; }

        // Foreign Key - Vendor

        // Payment Details
        public string? PaymentMode { get; set; }   // Cash / UPI / Bank / Cheque
        public string? Reference { get; set; }     // Transaction Id / Cheque No
        public string? Remark { get; set; }

        public DateTime PaymentDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        // Foreign Key - Financial Year
        public int FinancialYearId { get; set; }
        public virtual Financial_year? FinancialYear { get; set; }
    }
}
