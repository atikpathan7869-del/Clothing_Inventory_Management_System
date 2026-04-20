using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IOutward
    {
         public Task<ResponseResult> SaveOutward(Outword model);

        public Task<ResponseResult> GetAllOutwards();

        public Task<ResponseResult> GetOutwardById(int id);

        public Task<ResponseResult> UpdateOutward(Outword model);

        public Task<ResponseResult> DeleteOutward(int id);
    }
}
