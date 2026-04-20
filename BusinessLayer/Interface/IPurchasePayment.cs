using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IPurchasePayment
    {
        public  Task<ResponseResult> SavePurchasePayment(PurchasePayment purchasePayment);
        public Task<ResponseResult> UpdatePurchasePayment(PurchasePayment purchasePayment);
        public Task<ResponseResult> DeletePurchasePayment(int id);
        public Task<ResponseResult> GetPurchasePaymentById(int id);
        public Task<ResponseResult> GetAllPurchasePayments();
    }
}
