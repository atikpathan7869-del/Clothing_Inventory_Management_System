using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class PurchaseDetailsRepository : IPurchaseDetails
    {
        private readonly ApplicationDBContext _dbContext;

        public PurchaseDetailsRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ ADD
        public async Task<ResponseResult> AddPurchaseDetails(PurchaseDetails model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "PurchaseDetails data required");

                var purchaseExists = await _dbContext.tbl_Purchase
                    .AnyAsync(x => x.Id == model.PurchaseId);

                if (!purchaseExists)
                    return new ResponseResult("Fail", "Invalid PurchaseId");

                var productExists = await _dbContext.tbl_products
                    .AnyAsync(x => x.Id == model.ProductId);

                if (!productExists)
                    return new ResponseResult("Fail", "Invalid ProductId");

                // 🔥 CALCULATIONS
                model.GrossAmt = model.Qty * model.CostPrice;

                if (model.GstType == "Exclusive")
                {
                    model.GstAmt = (model.GrossAmt * model.GstPer) / 100;
                    model.Total = model.GrossAmt + model.GstAmt;
                }
                else
                {
                    model.GstAmt = model.GrossAmt -
                        (model.GrossAmt * 100 / (100 + model.GstPer));
                    model.Total = model.GrossAmt;
                }

                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_PurchaseDetails.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                // ✅ Return Clean Response (Projection)
                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.ProductId,
                    model.PurchaseId,
                    model.Qty,
                    model.CostPrice,
                    model.GrossAmt,
                    model.GstType,
                    model.GstPer,
                    model.GstAmt,
                    model.Total
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL
        public async Task<ResponseResult> GetAllPurchaseDetails()
        {
            try
            {
                var data = await _dbContext.tbl_PurchaseDetails
                    .Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        x.Id,
                        x.Qty,
                        x.CostPrice,
                        x.GrossAmt,
                        x.GstType,
                        x.GstPer,
                        x.GstAmt,
                        x.Total,
                        Product = new
                        {
                            x.Product!.Id,
                            x.Product.ProductName
                        },
                        Purchase = new
                        {
                            x.Purchase!.Id,
                            x.Purchase.BillNo
                        }
                    })
                    .ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET BY ID
        public async Task<ResponseResult> GetPurchaseDetailsById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_PurchaseDetails
                    .Where(x => x.Id == id && !x.IsDeleted)
                    .Select(x => new
                    {
                        x.Id,
                        x.Qty,
                        x.CostPrice,
                        x.GrossAmt,
                        x.GstType,
                        x.GstPer,
                        x.GstAmt,
                        x.Total
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Record not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET BY PURCHASE ID (Invoice Wise)
        public async Task<ResponseResult> GetPurchaseDetailsByPurchaseId(int purchaseId)
        {
            try
            {
                var result = await _dbContext.tbl_PurchaseDetails
                .Include(x => x.Product)
                .Where(x => x.PurchaseId == purchaseId && !x.IsDeleted)
                .Select(x => new
                {
                    id = x.Id,
                    productName = x.Product != null ? x.Product.ProductName : "",
                    size = x.Size,
                    color = x.Color,
                    qty = x.Qty,
                    costPrice = x.CostPrice,
                    gstPer = x.GstPer,
                    total = x.Total
                })
                .ToListAsync();

                return new ResponseResult("OK", result);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
        // ✅ UPDATE
        public async Task<ResponseResult> UpdatePurchaseDetails(PurchaseDetails model)
        {
            try
            {
                var existing = await _dbContext.tbl_PurchaseDetails
                    .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Record not found");

                existing.Qty = model.Qty;
                existing.CostPrice = model.CostPrice;
                existing.GstType = model.GstType;
                existing.GstPer = model.GstPer;

                // 🔥 Recalculate
                existing.GrossAmt = existing.Qty * existing.CostPrice;

                if (existing.GstType == "Exclusive")
                {
                    existing.GstAmt = (existing.GrossAmt * existing.GstPer) / 100;
                    existing.Total = existing.GrossAmt + existing.GstAmt;
                }
                else
                {
                    existing.GstAmt = existing.GrossAmt -
                        (existing.GrossAmt * 100 / (100 + existing.GstPer));
                    existing.Total = existing.GrossAmt;
                }

                existing.UpdatedAt = DateTime.Now;

                _dbContext.tbl_PurchaseDetails.Update(existing);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE (Soft Delete)
        public async Task<ResponseResult> DeletePurchaseDetails(int id)
        {
            try
            {
                var data = await _dbContext.tbl_PurchaseDetails
                    .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

                if (data == null)
                    return new ResponseResult("Fail", "Record not found");

                data.IsDeleted = true;
                data.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}