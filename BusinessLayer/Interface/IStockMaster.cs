using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IStockMaster
    {
         public  Task<ResponseResult> SaveStock(StockMaster model);

        public Task<ResponseResult> GetAllStock();

        public Task<ResponseResult> GetStockById(int id);

        public Task<ResponseResult> UpdateStock(StockMaster model);

        public Task<ResponseResult> DeleteStock(int id);
       public Task<ResponseResult> GetStockByBarcode(string barcode);

       public Task<ResponseResult> AvaliableStock ();
    }
}
