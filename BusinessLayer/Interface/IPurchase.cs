using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IPurchase
    {
        // ✅ CREATE
       public Task<ResponseResult> SavePurchase(Purchase purchase);

        // ✅ READ - Get All
        public Task<ResponseResult> GetAllPurchases();

        // ✅ READ - Get By Id
        public Task<ResponseResult> GetPurchaseById(int id);

        // ✅ UPDATE
        public Task<ResponseResult> UpdatePurchase(Purchase purchase);

        // ✅ DELETE (Soft Delete)
        public Task<ResponseResult> DeletePurchase(int id);
    }
}
