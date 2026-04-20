using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface ICreditNote
    {
       public Task<ResponseResult> SaveCreditNote(CreditNote model);

       public Task<ResponseResult> GetCreditByMobile(string mobile);
    }
}
