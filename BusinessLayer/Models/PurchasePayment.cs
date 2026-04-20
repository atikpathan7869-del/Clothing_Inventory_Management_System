using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class PurchasePayment
    {
        public int Id { get; set; }

        // 🔹 Foreign Key - PaymentMaster
        public int PaymentMasterId { get; set; }
        public virtual PaymentMaster? PaymentMaster { get; set; }

        // 🔹 Foreign Key - Purchase
        public int PurchaseId { get; set; }
        public virtual Purchase? Purchase { get; set; }

        // 🔹 Payment Info
        public decimal Amount { get; set; }

        // 🔹 Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        // 🔹 Soft Delete
        public bool IsDeleted { get; set; } = false;
    }
}
