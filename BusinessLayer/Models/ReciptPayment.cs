using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class ReciptPayment
    {
        public int Id { get; set; }

        // 🔹 Receipt Reference
        public int ReciptMasterId { get; set; }
        public virtual ReciptMaster? ReciptMaster { get; set; }

        // 🔹 Financial Year
        public int FinancialYearId { get; set; }
        public virtual Financial_year? FinancialYear { get; set; }

        // 🔥 Payment Details
        public decimal Amount { get; set; }

        public string PaymentMode { get; set; } = string.Empty;
        // Cash / UPI / Bank / Cheque

        public string? Reference { get; set; }
        // UTR / Cheque No / Transaction Id

        public string? Remark { get; set; }

        public DateTime PaymentDate { get; set; }

        // 🔹 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
