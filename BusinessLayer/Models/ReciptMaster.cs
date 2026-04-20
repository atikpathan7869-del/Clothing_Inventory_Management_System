using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class ReciptMaster
    {
        public ReciptMaster()
        {
            ReciptPayments = new HashSet<ReciptPayment>();
            ReciptItems = new HashSet<ReciptItem>();
            SalesReturns = new HashSet<SalesReturn>();
            SalesReturn_Items = new HashSet<SalesReturn_Item>();
        }

        public virtual ICollection<ReciptPayment> ReciptPayments { get; set; }
        public virtual ICollection<ReciptItem> ReciptItems { get; set; }
        public virtual ICollection<SalesReturn> SalesReturns { get; set; }
        public virtual ICollection<SalesReturn_Item> SalesReturn_Items { get; set; }
        public int Id { get; set; }

        // 🔹 Receipt Info
        public int ReciptNo { get; set; }
        public DateTime BillDate { get; set; }

        // 🔹 Financial Year
        public int FinancialYearId { get; set; }
        public virtual Financial_year? FinancialYear { get; set; }

        // 🔹 Staff Reference
        public int StaffMasterId { get; set; }
        public virtual StaffMaster? StaffMaster { get; set; }

        // 🔹 Amount Details
        public decimal GrossAmount { get; set; }
        public decimal GSTAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal NetTotal { get; set; }
        public string CustomerName { get; set; }
        public string CustomerMobile { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

    }
}
