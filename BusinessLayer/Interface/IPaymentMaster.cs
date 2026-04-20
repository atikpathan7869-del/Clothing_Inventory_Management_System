using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    using BusinessLayer.Models;

    public interface IPaymentMaster
    {
      public  Task<ResponseResult> GetAllPayments();

        public Task<ResponseResult> GetPaymentById(int id);

        public Task<ResponseResult> AddPayment(PaymentMaster model);

        public Task<ResponseResult?> UpdatePayment(PaymentMaster model);

        public Task<ResponseResult> DeletePayment(int id);

        public Task<ResponseResult> GetPaymentsByVendorId(int vendorId);

        public Task<ResponseResult> GetPaymentsByFinancialYearId(int financialYearId);
        public Task<ResponseResult> getPaymentDues();

        public Task<ResponseResult> getBalanceSheet(int VendorId);
    }
}
