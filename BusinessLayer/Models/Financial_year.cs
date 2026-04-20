using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class Financial_year
    {
        public Financial_year()
        {
            PaymentMasters = new HashSet<PaymentMaster>();
            Purchases = new HashSet<Purchase>();
            ReciptMasters = new HashSet<ReciptMaster>();
            ReciptPayment  = new HashSet<ReciptPayment>();
            
        }

        public virtual ICollection<PaymentMaster> PaymentMasters { get; set; }
        public virtual ICollection<Purchase> Purchases { get; set; }
        public virtual ICollection<ReciptMaster> ReciptMasters { get; set; }
        public virtual ICollection<ReciptPayment> ReciptPayment { get; set; }
        
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = false;
        public DateTime StartDate { get; set; }
        public DateTime EndDate{ get; set; }
        public bool isDelete { get; set; }
        public DateTime CreatedAt { get; set; } =DateTime.Now;
        // public DateTime UpdatedAt { get; set; } =DateTime.Now;
        public DateTime UpdateAt { get; set; } = DateTime.Now;

    }
}
