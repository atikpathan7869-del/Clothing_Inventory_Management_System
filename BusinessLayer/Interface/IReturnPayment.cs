using BusinessLayer.Models;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IReturnPayment
    {
        // 🔹 Create Refund Payment
       public Task<ResponseResult> SaveReturnPayment(ReturnPayment model);

        // 🔹 Get All Refund Payments
        public Task<ResponseResult> GetAllReturnPayments();

        // 🔹 Get By Id
        public Task<ResponseResult> GetReturnPaymentById(int id);

        // 🔹 Get By SalesReturn
        public Task<ResponseResult> GetReturnPaymentsBySalesReturnId(int salesReturnId);

        // 🔹 Delete (Soft Delete)
        public Task<ResponseResult> DeleteReturnPayment(int id);
    }
}