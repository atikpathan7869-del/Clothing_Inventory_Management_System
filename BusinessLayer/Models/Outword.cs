using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class Outword
    {
        public Outword()
        {
            OutWardItems = new HashSet<OutWardItem>();
        }

        public ICollection<OutWardItem> OutWardItems { get; set; }
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Reason { get; set; } = string.Empty;

        public string ContactDetails { get; set; } = string.Empty;

        public int StaffMasterId { get; set; }
        public virtual StaffMaster? StaffMaster { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
