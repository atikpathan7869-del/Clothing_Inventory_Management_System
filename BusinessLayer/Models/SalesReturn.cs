using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class SalesReturn
    {
        public SalesReturn()
        {
            SalesReturn_Items = new HashSet<SalesReturn_Item>();
            CreditNotes = new HashSet<CreditNote>();
            ReturnPayments = new HashSet<ReturnPayment>();
        }

        public virtual ICollection<SalesReturn_Item> SalesReturn_Items { get; set; }

        public virtual ICollection<ReturnPayment> ReturnPayments { get; set; }
        public virtual ICollection<CreditNote> CreditNotes { get; set; }
        public int Id { get; set; }

        // 🔹 Reference to Original Sale
        public int ReciptMasterId { get; set; }
        public virtual ReciptMaster? ReciptMaster { get; set; }

        // 🔹 Staff Handling Return
        public int StaffMasterId { get; set; }
        public virtual StaffMaster? StaffMaster { get; set; }

        // 🔹 Return Details
        public DateTime ReturnDate { get; set; } = DateTime.Now;

        public string ReturnType { get; set; } = string.Empty;
        // Example: "Refund", "Exchange", "Credit Note"

        public decimal GrossAmount { get; set; }        // Before GST
        public decimal GSTAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal NetAmount { get; set; }          // Final refund/credit amount

        public string? Reason { get; set; }
        public string? Remark { get; set; }

        // 🔹 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }


    public class SalesReturn_Item
    {
        public int Id { get; set; }

        public int SalesReturnId { get; set; }
        public virtual SalesReturn? SalesReturn { get; set; }



        public int ReciptItemId { get; set; }
        public virtual ReciptItem? ReciptItem { get; set; }

        public int Qty { get; set; }
    }


    public class ReturnPayment
    {
        public int Id { get; set; }

        // 🔹 Reference to Sales Return
        public int SalesReturnId { get; set; }
        public virtual SalesReturn? SalesReturn { get; set; }

        // 🔹 Payment Details
        public string PaymentType { get; set; } = string.Empty;
        // Example: Cash, UPI, Bank, CreditNote

        public string? Reference { get; set; }   // Transaction ID / Bank Ref No

        public decimal Amount { get; set; }

        public DateTime PaidDate { get; set; } = DateTime.Now;

        // 🔹 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
        
    }
}
