using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Models
{
    public class Category
    {
        public Category()
        {

            Products = new HashSet<Product>();
        }
        public int Id { get; set; } 
        public string Name { get; set; }   = string.Empty;

     
        public DateTime CreatedAt { get; set; } = DateTime.Now;

  

        public string? Descriptions { get; set; }
     

        public bool IsDeleted { get; set; } = false;
        

        public DateTime? UpdatedAt { get; set; }

        public ICollection<Product> Products { get; set; }
    }
}
