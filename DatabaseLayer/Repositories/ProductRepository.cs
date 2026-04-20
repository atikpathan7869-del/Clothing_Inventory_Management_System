using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class ProductRepositories : IProduct
    {
        private readonly ApplicationDBContext _dbContext;

        public ProductRepositories(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ SAVE PRODUCT
        public async Task<ResponseResult> SaveProduct(Product product)
        {
            try
            {
                if (product == null)
                    return new ResponseResult("Fail", "Product data is required");

                // 🔹 Check Brand Exists
                var brandExists = await _dbContext.tbl_Brand
                    .AnyAsync(b => b.Id == product.BrandId && b.DeletedAt == null);

                if (!brandExists)
                    return new ResponseResult("Fail", "Brand does not exist");

                // 🔹 Check Category Exists
                var categoryExists = await _dbContext.tbl_Category
                            .AnyAsync(c => c.Id == product.CategoryId && !c.IsDeleted);

                if (!categoryExists)
                    return new ResponseResult("Fail", "Category does not exist");

                // 🔹 Check Duplicate Product
                var duplicate = await _dbContext.tbl_products
                    .FirstOrDefaultAsync(p =>
                        p.ProductName.ToLower() == product.ProductName.ToLower()
                        && p.DeletedAt == null);

                if (duplicate != null)
                    return new ResponseResult("Fail", "Product already exists");

                product.CreatedAt = DateTime.Now;
                product.IsAvailable = product.StockQuantity > 0;
                product.DeletedAt = null;

                await _dbContext.tbl_products.AddAsync(product);
                await _dbContext.SaveChangesAsync();

                return await GetProductById(product.Id);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL PRODUCTS
        public async Task<ResponseResult> GetAllProducts()
        {
            try
            {
                var products = await _dbContext.tbl_products
                    .Where(p => p.DeletedAt == null)
                    .Select(p => new
                    {
                        p.Id,
                        p.ProductName,
                        p.BrandId,
                        BrandName = p.Brand.Name,
                        p.CategoryId,
                        CategoryName = p.Category.Name,
                        p.Size,
                        p.Color,
                        p.Fabric,
                        p.Price,
                        p.StockQuantity,
                        p.ImageUrl,
                        p.IsAvailable
                    })
                    .ToListAsync();

                return new ResponseResult("OK", products);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET PRODUCT BY ID
        public async Task<ResponseResult> GetProductById(int id)
        {
            try
            {
                var product = await _dbContext.tbl_products
                    .Where(p => p.Id == id && p.DeletedAt == null)
                    .Select(p => new
                    {
                        p.Id,
                        p.ProductName,
                        p.BrandId,
                        BrandName = p.Brand!.Name,
                        p.CategoryId,
                        CategoryName = p.Category!.Name,
                        p.Size,
                        p.Color,
                        p.Fabric,
                        p.Price,
                        p.StockQuantity,
                        p.ImageUrl,
                        p.IsAvailable,
                        p.CreatedAt,
                        p.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                if (product == null)
                    return new ResponseResult("Fail", "Product not found");

                return new ResponseResult("OK", product);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE PRODUCT
        public async Task<ResponseResult> UpdateProduct(int id, Product product)
        {
            try
            {
                var existingProduct = await _dbContext.tbl_products
                    .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

                if (existingProduct == null)
                    return new ResponseResult("Fail", "Product not found");

                // 🔹 Validate Brand Exists
                var brandExists = await _dbContext.tbl_Brand
                    .AnyAsync(b => b.Id == product.BrandId && b.DeletedAt == null);

                if (!brandExists)
                    return new ResponseResult("Fail", "Brand does not exist");

                var categoryExists = await _dbContext.tbl_Category.AnyAsync(c => c.Id == product.CategoryId && !c.IsDeleted);

                if (!categoryExists)
                    return new ResponseResult("Fail", "Category does not exist");

                // 🔹 Update Fields
                existingProduct.ProductName = product.ProductName;
                existingProduct.BrandId = product.BrandId;
                existingProduct.CategoryId = product.CategoryId;
                existingProduct.Size = product.Size;
                existingProduct.Color = product.Color;
                existingProduct.Fabric = product.Fabric;
                existingProduct.Price = product.Price;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.ImageUrl = product.ImageUrl;
                existingProduct.IsAvailable = product.StockQuantity > 0;
                existingProduct.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return await GetProductById(id);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE PRODUCT
        public async Task<ResponseResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _dbContext.tbl_products
                    .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);

                if (product == null)
                    return new ResponseResult("Fail", "Product not found");

                product.DeletedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Product deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}
