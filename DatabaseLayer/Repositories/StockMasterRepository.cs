using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class StockMasterRepository : IStockMaster
    {
        private readonly ApplicationDBContext _dbContext;

        public StockMasterRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE STOCK =================
        public async Task<ResponseResult> SaveStock(StockMaster model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Stock data is required");

                // Product Validation
                var productExists = await _dbContext.tbl_products
                    .AnyAsync(x => x.Id == model.ProductId);

                if (!productExists)
                    return new ResponseResult("Fail", "Invalid Product");

                // Staff Validation
                var staffExists = await _dbContext.tbl_StaffMaster
                    .AnyAsync(x => x.Id == model.StaffMasterId);

                if (!staffExists)
                    return new ResponseResult("Fail", "Invalid Staff");

                int count = await _dbContext.tbl_StockMaster
                    .Where(o => o.CreatedAt.Date == DateTime.Now.Date)
                    .CountAsync();

                model.StockCode = $"{DateTime.Now:yyyyMMdd}{count + 1}";
                model.Barcode = Guid.NewGuid().ToString().Substring(0, 10);
                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_StockMaster.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Stock Added");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }

        // ================= GET ALL =================
        // ================= GET ALL =================
        public async Task<ResponseResult> GetAllStock()
        {
            try
            {
                var data = await _dbContext.tbl_StockMaster
                .Include(p => p.Product)
                .Include(x => x.StaffMaster)
                .Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.StockCode,
                    x.Barcode,
                    x.Qty,

                    // Dhyan dein: Ye key name frontend ke 'viewData.costPrice' se match hona chahiye
                    CostPrice = x.CostPrice,

                    ProductId = x.Product!.Id,
                    ProductName = x.Product.ProductName,
                    x.Size,
                    x.Color,
                    x.SalePrice,
                    x.RateGST,
                    x.InwardDate,
                    Staff = x.StaffMaster != null ? x.StaffMaster.Name : "N/A"
                })
                .ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= UPDATE STOCK =================
        public async Task<ResponseResult> UpdateStock(StockMaster model)
        {
            try
            {
                var existing = await _dbContext.tbl_StockMaster
                    .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Stock not found");

                existing.Qty = model.Qty;
                existing.CostPrice = model.CostPrice;
                existing.Size = model.Size;
                existing.Color = model.Color;
                existing.SalePrice = model.SalePrice;
                existing.RateGST = model.RateGST;
                existing.InwardDate = model.InwardDate;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Stock updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE =================
        public async Task<ResponseResult> DeleteStock(int id)
        {
            try
            {
                var stock = await _dbContext.tbl_StockMaster
                    .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

                if (stock == null)
                    return new ResponseResult("Fail", "Stock not found");

                stock.IsDeleted = true;
                stock.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Stock deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY BARCODE =================
        public async Task<ResponseResult> GetStockByBarcode(string barcode)
        {
            try
            {
                var data = await _dbContext.tbl_StockMaster
                    .Include(p => p.Product)
                    .Where(x => x.Barcode == barcode && !x.IsDeleted)
                    .Select(x => new
                    {
                        x.Id,
                        x.StockCode,
                        x.Barcode,
                        ProductName = x.Product != null ? x.Product.ProductName : "Unknown",
                        x.Qty,
                        x.SalePrice,
                        x.CostPrice,
                        x.RateGST,
                        x.Size,
                        x.Color
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "No product found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        public Task<ResponseResult> GetStockById(int id)
        {
            throw new NotImplementedException();
        }

        // ================= AVAILABLE STOCK =================
        public async Task<ResponseResult> AvaliableStock()
        {
            try
            {
                var data = await _dbContext.tbl_StockMaster
                    .Include(p => p.Product)
                    .Where(x => !x.IsDeleted && x.Qty > 0) // Filter for non-deleted and in-stock items
                    .OrderByDescending(x => x.CreatedAt)
                    .Select(x => new
                    {
                        x.Id,
                        x.StockCode,
                        x.Barcode,
                        x.Qty,
                        x.CostPrice,
                        x.SalePrice,
                        x.RateGST,
                        x.Size,
                        x.Color,
                        ProductId = x.Product!.Id,
                        ProductName = x.Product.ProductName,
                        // Helpful for UI alerts
                        Status = x.Qty <= 5 ? "Low Stock" : "In Stock"
                    })
                    .ToListAsync();

                if (data == null || !data.Any())
                    return new ResponseResult("OK", "No stock available currently");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}