using BusinessLayer.Model;
using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace DatabaseLayer.ApplicationContext
{
    public class ApplicationDBContext : DbContext
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
            : base(options)
        {
        }
        // 🔹 Brand
        public DbSet<Brand> tbl_Brand { get; set; }
        // 🔹 Category
        public DbSet<Category> tbl_Category { get; set; }
        // 🔹 Product
        public DbSet<Product> tbl_products { get; set; }

        public DbSet<Financial_year> tbl_Financial_Year { get; set; }
        // 🔹 Vendor
        public DbSet<Vendor> tbl_Vendor { get; set; }
        // 🔹 Purchase
        public DbSet<Purchase> tbl_Purchase { get; set; }

        public DbSet<Admin> tbl_Admin { get; set; }

        public DbSet<PaymentMaster> tbl_PaymentMaster { get; set; } 

        public DbSet<PurchasePayment> tbl_PurchasePayment { get; set; }
        
        public DbSet<PurchaseDetails> tbl_PurchaseDetails { get; set; }

        public DbSet<StaffMaster> tbl_StaffMaster { get; set; }

        public DbSet<StockMaster> tbl_StockMaster { get; set; }

        public DbSet<Outword> Outwords { get; set; }

        public DbSet<OutWardItem> tbl_Outword_Item { get; set; }

        public DbSet<ReciptMaster> tbl_ReciptMaster { get;set; }

        public DbSet<ReciptPayment> tbl_ReciptPayment { get; set; }

        public DbSet<ReciptItem> tbl_ReciptItem { get; set; }

        public DbSet<SalesReturn> tbl_SalesReturn { get; set; }

        public DbSet<SalesReturn_Item> tbl_SalesReturn_Item { get; set; }

        public DbSet<CreditNote> tbl_CreditNote { get; set; }

        public DbSet<ReturnPayment> tbl_ReturnPayment { get; set; }


    }
}
