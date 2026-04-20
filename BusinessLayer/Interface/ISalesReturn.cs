using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface ISalesReturn
    {
        // 🔹 Create
         public Task<ResponseResult> SaveSalesReturn(SalesReturn model);

        // 🔹 Read
        public Task<ResponseResult> GetAllSalesReturns();
        public Task<ResponseResult> GetSalesReturnById(int id);
        public Task<ResponseResult> GetSalesReturnsByReceiptId(int ReciptNo, int FinancialYearId);

        // 🔹 Update
        public Task<ResponseResult> UpdateSalesReturn(SalesReturn model);

        // 🔹 Delete (Soft Delete)
        public Task<ResponseResult> DeleteSalesReturn(int id);
        public Task<ResponseResult> GetSalesReturnsByMobile(string MobileNo, int FinancialYearId);
        public Task<ResponseResult> SaveSalesReturnExchange(SalesReturn model);
    }
}
