using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class BrandRepositories : IBrand
    {
        private readonly ApplicationDBContext _dbContext;

        public BrandRepositories(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ SAVE BRAND
        public async Task<ResponseResult> SaveBrand(Brand brand)
        {
            try
            {
                if (brand == null)
                    return new ResponseResult("Fail", "Brand data is required");

                var existingBrand = await _dbContext.tbl_Brand
                    .FirstOrDefaultAsync(b => b.Name.ToLower() == brand.Name.ToLower() && !b.IsDeleted);

                if (existingBrand != null)
                    return new ResponseResult("Fail", "Brand already exists");

                brand.CreatedAt = DateTime.Now;
                brand.IsDeleted = false;

                await _dbContext.tbl_Brand.AddAsync(brand);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", brand);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL BRANDS (Only Not Deleted)
        public async Task<ResponseResult> GetAllBrands()
        {
            try
            {
                var result = await _dbContext.tbl_Brand
                    .Where(b => !b.IsDeleted)
                    .ToListAsync();

                return new ResponseResult("OK", result);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET BRAND BY ID
        public async Task<ResponseResult> GetBrandById(int id)
        {
            try
            {
                var brand = await _dbContext.tbl_Brand
                    .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);

                if (brand == null)
                    return new ResponseResult("Fail", "Brand not found");

                return new ResponseResult("OK", brand);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE BRAND
        public async Task<ResponseResult> UpdateBrand(Brand brand)
        {
            try
            {
                if (brand == null)
                    return new ResponseResult("Fail", "Brand data is required");

                var existingBrand = await _dbContext.tbl_Brand
                    .FirstOrDefaultAsync(b => b.Id == brand.Id && !b.IsDeleted);

                if (existingBrand == null)
                    return new ResponseResult("Fail", "Brand not found");

                // Duplicate Name Check (excluding current record)
                var duplicate = await _dbContext.tbl_Brand
                    .FirstOrDefaultAsync(b => b.Name.ToLower() == brand.Name.ToLower()
                                           && b.Id != brand.Id
                                           && !b.IsDeleted);

                if (duplicate != null)
                    return new ResponseResult("Fail", "Brand name already exists");

                existingBrand.Name = brand.Name;
                existingBrand.UpdatedAt = DateTime.Now;

                _dbContext.tbl_Brand.Update(existingBrand);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", existingBrand);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE BRAND (Soft Delete)
        public async Task<ResponseResult> DeleteBrand(int id)
        {
            try
            {
                var brand = await _dbContext.tbl_Brand
                    .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted);

                if (brand == null)
                    return new ResponseResult("Fail", "Brand not found");

                brand.IsDeleted = true;
                brand.UpdatedAt = DateTime.Now;

                _dbContext.tbl_Brand.Update(brand);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Brand deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}
