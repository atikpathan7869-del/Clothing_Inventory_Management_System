using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IPurchaseDetails
    {
       public Task<ResponseResult> AddPurchaseDetails(PurchaseDetails model);

        public Task<ResponseResult> GetAllPurchaseDetails();

        public Task<ResponseResult> GetPurchaseDetailsById(int id);

        public Task<ResponseResult> GetPurchaseDetailsByPurchaseId(int purchaseId);

        public Task<ResponseResult> UpdatePurchaseDetails(PurchaseDetails model);

        public Task<ResponseResult> DeletePurchaseDetails(int id);
    }
}
