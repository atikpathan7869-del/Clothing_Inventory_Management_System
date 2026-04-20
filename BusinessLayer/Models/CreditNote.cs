using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class CreditNote
    {
        public int Id { get; set; }


        public int SalesReturnId { get; set; }
        public virtual SalesReturn? SalesReturn { get; set; }

        public bool IsUsed { get; set; } = false;
        public int? UsedInReceiptId { get; set; }
        public decimal Amount { get; set; }

        // 🔹 Audit
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
