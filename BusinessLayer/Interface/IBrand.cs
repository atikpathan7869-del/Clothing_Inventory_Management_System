using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IBrand
    {
        public Task<ResponseResult> SaveBrand (Brand brand );

        public Task<ResponseResult> UpdateBrand (Brand brand );
        public Task<ResponseResult> DeleteBrand (int id );
        public Task<ResponseResult> GetAllBrands();

        public Task<ResponseResult> GetBrandById(int id);



    }
}
