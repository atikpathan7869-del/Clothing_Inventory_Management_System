using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IReciptPayment
    {
         public Task<ResponseResult> SaveReciptPayment(ReciptPayment model);

        public Task<ResponseResult> GetAllReciptPayments();

        public Task<ResponseResult> GetReciptPaymentById(int id);

        public Task<ResponseResult> GetReciptPaymentsByReciptId(int reciptMasterId);

        public Task<ResponseResult> UpdateReciptPayment(ReciptPayment model);

        public Task<ResponseResult> DeleteReciptPayment(int id);
    }
}
