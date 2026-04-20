using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IFinancial_year
    {
        public Task<ResponseResult> saveFinancialyear(Financial_year FY);
        public Task<ResponseResult> listFinancialyear();

        public Task<ResponseResult> detailFinancialyear(int id);
        public Task<ResponseResult> updateFinancialyear(int id);
        public Task<ResponseResult> deleteFinancialyear(int id);

        public Task<ResponseResult> updateFinancialyear(Financial_year FY,int Id);
      


    }
}
