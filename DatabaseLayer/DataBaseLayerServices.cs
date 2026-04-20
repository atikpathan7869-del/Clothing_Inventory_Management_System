using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DatabaseLayer
{
    public static class DataBaseLayerServices
    {
        public static IServiceCollection AddDataAccessLayerServices(this IServiceCollection services)
        {
            services.AddDbContext<ApplicationDBContext>(o => o.UseSqlServer("Data Source=apnatiffin.cn62q6e8yukm.ap-south-1.rds.amazonaws.com;Initial Catalog=RiverI_IMS;Persist Security Info=True;User ID=admin;Password=chand_2026;Trust Server Certificate=True"));
            return services;
        }
    }
}
