using BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLayer.Interface
{
    public interface ICategory
    {
        Task<ResponseResult> SaveCategory(Category category);

        Task<ResponseResult> UpdateCategory(Category category);

        Task<ResponseResult> DeleteCategory(int id);

        Task<ResponseResult> GetAllCategories();

        Task<ResponseResult> GetCategoryById(int id);
    }
}
