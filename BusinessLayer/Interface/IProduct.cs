using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface IProduct
    {
        Task<ResponseResult> SaveProduct(Product product);

        Task<ResponseResult> GetAllProducts();

        Task<ResponseResult> GetProductById(int id);

        Task<ResponseResult> UpdateProduct(int id, Product product);

        Task<ResponseResult> DeleteProduct(int id);
    }
}
