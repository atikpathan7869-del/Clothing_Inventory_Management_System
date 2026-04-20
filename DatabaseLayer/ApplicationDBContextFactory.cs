using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DatabaseLayer
{
    public class ApplicationDBContextFactory : IDesignTimeDbContextFactory<ApplicationDBContext>
    {
        public ApplicationDBContext CreateDbContext(string[] args)
        {
            var options = new DbContextOptionsBuilder<ApplicationDBContext>().UseSqlServer("Data Source=apnatiffin.cn62q6e8yukm.ap-south-1.rds.amazonaws.com;Initial Catalog=RiverI_IMS;Persist Security Info=True;User ID=admin;Password=chand_2026;Trust Server Certificate=True").Options;

            return new ApplicationDBContext(options);
        }
    }


}
