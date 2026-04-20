using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class CategoryRepositories : ICategory
    {
        private readonly ApplicationDBContext _dbContext;

        public CategoryRepositories(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ SAVE CATEGORY
        public async Task<ResponseResult> SaveCategory(Category category)
        {
            try
            {
                if (category == null)
                    return new ResponseResult("Fail", "Category data is required");

                var existingCategory = await _dbContext.tbl_Category
                    .FirstOrDefaultAsync(c =>
                        c.Name.ToLower() == category.Name.ToLower()
                        && !c.IsDeleted);

                if (existingCategory != null)
                    return new ResponseResult("Fail", "Category already exists");

                category.CreatedAt = DateTime.Now;
                category.IsDeleted = false;

                await _dbContext.tbl_Category.AddAsync(category);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {
                    category.Id,
                    category.Name,
                    category.Descriptions,
                    category.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL CATEGORIES
        public async Task<ResponseResult> GetAllCategories()
        {
            try
            {
                var result = await _dbContext.tbl_Category
                    .Where(c => !c.IsDeleted)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Descriptions,
                        c.CreatedAt
                    })
                    .ToListAsync();

                return new ResponseResult("OK", result);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET CATEGORY BY ID
        public async Task<ResponseResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _dbContext.tbl_Category
                    .Where(c => c.Id == id && !c.IsDeleted)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Descriptions,
                        c.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (category == null)
                    return new ResponseResult("Fail", "Category not found");

                return new ResponseResult("OK", category);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE CATEGORY
        public async Task<ResponseResult> UpdateCategory(Category category)
        {
            try
            {
                if (category == null)
                    return new ResponseResult("Fail", "Category data is required");

                var existingCategory = await _dbContext.tbl_Category
                    .FirstOrDefaultAsync(c =>
                        c.Id == category.Id && !c.IsDeleted);

                if (existingCategory == null)
                    return new ResponseResult("Fail", "Category not found");

                var duplicate = await _dbContext.tbl_Category
                    .FirstOrDefaultAsync(c =>
                        c.Name.ToLower() == category.Name.ToLower()
                        && c.Id != category.Id
                        && !c.IsDeleted);

                if (duplicate != null)
                    return new ResponseResult("Fail", "Category name already exists");

                existingCategory.Name = category.Name;
                existingCategory.Descriptions = category.Descriptions;
                existingCategory.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {
                    existingCategory.Id,
                    existingCategory.Name,
                    existingCategory.Descriptions,
                    existingCategory.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE CATEGORY (Soft Delete using IsDeleted)
        public async Task<ResponseResult> DeleteCategory(int id)
        {
            try
            {
                var category = await _dbContext.tbl_Category
                    .FirstOrDefaultAsync(c =>
                        c.Id == id && !c.IsDeleted);

                if (category == null)
                    return new ResponseResult("Fail", "Category not found");

                category.IsDeleted = true;
                category.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Category deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}