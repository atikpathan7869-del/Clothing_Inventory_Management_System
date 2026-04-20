using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IReciptMaster
    {
        
       public Task<ResponseResult> SaveRecipt(ReciptMaster model);

        public Task<ResponseResult> GetAllRecipts();

        public Task<ResponseResult> GetReciptById(int id);

        public Task<ResponseResult> UpdateRecipt(ReciptMaster model);

        public Task<ResponseResult> DeleteRecipt(int id);

         public Task<ResponseResult> AddDuesPayment(ReciptPayment payment);
    }
}
