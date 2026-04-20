using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class OutWardItem
    {
        public int Id { get; set; }
        public int OutwordId { get; set; }
        public virtual Outword? Outword { get; set; }
        public int StockMasterId { get; set; }
        public virtual StockMaster? StockMaster { get; set; }
        public int StaffMasterId { get; set; }
        public virtual StaffMaster? StaffMaster { get; set; }
        public int Qty { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;

    }
}
