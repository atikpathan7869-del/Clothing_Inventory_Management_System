using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    using System;

    namespace BusinessLayer.Models
    {
        public class StaffMaster
        {
            public StaffMaster()
            {
                StockMasters = new HashSet<StockMaster>();
                Outwords = new HashSet<Outword>();
                OutWardItems = new HashSet<OutWardItem>();
                ReciptMasters = new HashSet<ReciptMaster>();
                SalesReturns = new HashSet<SalesReturn>();
            }
            public ICollection<StockMaster> StockMasters { get; set; }
            public ICollection<Outword> Outwords { get; set; }
            public ICollection<OutWardItem> OutWardItems { get; set; }
            public ICollection<ReciptMaster> ReciptMasters { get; set; }
            public virtual ICollection<SalesReturn> SalesReturns { get; set; }
            public int Id { get; set; }

            public string Name { get; set; } = string.Empty;

            // 📞 Contact
            public string ContactNo { get; set; } = string.Empty;

            // 📧 Email
            public string Email { get; set; } = string.Empty;

            // 📅 Date of Joining
            public DateTime DOJ { get; set; }

            // 👤 Gender
            public string Gender { get; set; } = string.Empty;
            // Example: Male / Female / Other

            // 🧑‍💼 Role
            public string Role { get; set; } = string.Empty;
            // Example: Manager / Accountant / Sales

            // 🔐 Added Security Fields
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;

            // 🕒 Audit Fields
            public DateTime CreatedAt { get; set; } = DateTime.Now;

            public DateTime? UpdatedAt { get; set; }

            public bool IsDeleted { get; set; } = false;

        }
    }
}
