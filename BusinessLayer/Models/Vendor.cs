using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class Vendor
    {
        public Vendor()
        {
            purchase = new HashSet<Purchase>();

            PaymentMasters = new HashSet<PaymentMaster>();
        }

        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public ICollection<Purchase> purchase { get; set; }

        public virtual ICollection<PaymentMaster> PaymentMasters { get; set; }
        public string ContactPerson { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string GSTIN { get; set; } = string.Empty;

        public string PAN { get; set; } = string.Empty;

        public string BankAccountName { get; set; } = string.Empty;

        public string AccountNo { get; set; } = string.Empty;

        public string IFSC { get; set; } = string.Empty;

        public string AccountHolderName { get; set; } = string.Empty;

        public bool IsDelete { get; set; } = false;
    }

}
