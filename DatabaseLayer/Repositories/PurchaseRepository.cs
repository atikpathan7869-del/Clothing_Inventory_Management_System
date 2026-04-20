using BusinessLayer.Interface;
using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class PurchaseRepository : IPurchase
    {
        private readonly ApplicationDBContext _dbContext;

        public PurchaseRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE PURCHASE =================
        public async Task<ResponseResult> SavePurchase(Purchase purchase)
        {
            try
            {
                if (purchase == null)
                    return new ResponseResult("Fail", "Purchase data is required");

                // Vendor Validation
                var vendorExists = await _dbContext.tbl_Vendor
                    .AnyAsync(v => v.Id == purchase.VendorId && !v.IsDelete);

                if (!vendorExists)
                    return new ResponseResult("Fail", "Vendor does not exist");

                // Financial Year Validation
                var financialYear = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(f => f.Id == purchase.FinancialYearId && !f.isDelete);

                if (financialYear == null)
                    return new ResponseResult("Fail", "Financial Year does not exist");

                if (purchase.BillDate < financialYear.StartDate ||
                    purchase.BillDate > financialYear.EndDate)
                {
                    return new ResponseResult("Fail",
                        $"Bill Date must be between {financialYear.StartDate:yyyy-MM-dd} and {financialYear.EndDate:yyyy-MM-dd}");
                }

                // Duplicate BillNo
                var duplicateBill = await _dbContext.tbl_Purchase
                    .AnyAsync(p => p.BillNo == purchase.BillNo && !p.IsDeleted);

                if (duplicateBill)
                    return new ResponseResult("Fail", "Bill Number already exists");

                purchase.CreatedAt = DateTime.Now;
                purchase.IsDeleted = false;

                /* ================= SAVE PURCHASE ================= */

                await _dbContext.tbl_Purchase.AddAsync(purchase);
                await _dbContext.SaveChangesAsync();

                /* ================= GET PURCHASE DETAILS ================= */

                var details = await _dbContext.tbl_PurchaseDetails
                    .Where(x => x.PurchaseId == purchase.Id)
                    .ToListAsync();

                /* ================= STOCK SAVE ================= */

                if (details != null && details.Any())
                {
                    foreach (var item in details)
                    {
                        int count = await _dbContext.tbl_StockMaster
                            .Where(x => x.CreatedAt.Date == DateTime.Now.Date)
                            .CountAsync();

                        var stock = new StockMaster
                        {
                            ProductId = item.ProductId,

                            StaffMasterId = 1,

                            Size = item.Size,
                            Color = item.Color,

                            Qty = (int)item.Qty,
                            CostPrice=item.CostPrice,
                            RateGST = item.GstPer,
                            SalePrice = item.SalePrice,

                            InwardDate = purchase.BillDate,

                            StockCode = $"{DateTime.Now:yyyyMMdd}{count + 1}",

                            Barcode = Guid.NewGuid().ToString().Substring(0, 12),

                            CreatedAt = DateTime.Now,
                            IsDeleted = false
                        };

                        await _dbContext.tbl_StockMaster.AddAsync(stock);
                    }

                    await _dbContext.SaveChangesAsync();
                }

                /* ================= RESPONSE ================= */

                return new ResponseResult("OK", new
                {
                    purchase.Id,
                    purchase.BillNo,
                    purchase.BillDate,
                    purchase.NetAmount,
                    purchase.FinancialYearId
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
        // ================= GET ALL =================
        public async Task<ResponseResult> GetAllPurchases()
        {
            try
            {
                var result = await _dbContext.tbl_Purchase
                    .Where(p => !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.BillNo,
                        p.BillDate,
                        p.NetAmount,
                        Vendor = new
                        {
                            p.Vendor!.Id,
                            p.Vendor!.Name
                        },
                        Financial_year = new
                        {
                            p.FinancialYear!.Id,
                            p.FinancialYear!.Name
                        },
                        payments = p.PurchasePayments.Sum(o=> (o != null ? o.Amount : 0)),
                        dues = (p.NetAmount - p.PurchasePayments.Sum(o => (o != null ? o.Amount : 0)))
                    })
                    .ToListAsync();

                return new ResponseResult("OK", result);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY ID =================
        public async Task<ResponseResult> GetPurchaseById(int id)
        {
            try
            {
                var purchase = await _dbContext.tbl_Purchase
                    .Where(p => p.Id == id && !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.BillNo,
                        p.BillDate,
                        p.DueDate,
                        p.GrossAmount,
                        p.GSTAmount,
                        p.NetAmount,
                        Vendor = new
                        {
                            p.Vendor!.Id,
                            p.Vendor!.Name
                        },
                        Financial_year = new
                        {
                            p.FinancialYear!.Id,
                            p.FinancialYear!.Name
                        },

                        // 🟢 ADDED: Purchase Detail with Product Join
                        PurchaseDetail = _dbContext.tbl_PurchaseDetails
                            .Where(pd => pd.PurchaseId == p.Id && !pd.IsDeleted)
                            .Select(pd => new {
                                pd.Id,
                                pd.Qty,
                                pd.CostPrice,
                                pd.Size,
                                pd.Color,
                                // Product Name fetch karne ke liye join logic
                                Product = new
                                {
                                    ProductName = _dbContext.tbl_products
                                                    .Where(prod => prod.Id == pd.ProductId)
                                                    .Select(prod => prod.ProductName)
                                                    .FirstOrDefault() ?? "Unknown Product"
                                }
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (purchase == null)
                    return new ResponseResult("Fail", "Purchase not found");

                return new ResponseResult("OK", purchase);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= UPDATE =================
        public async Task<ResponseResult> UpdatePurchase(Purchase purchase)
        {
            try
            {
                if (purchase == null)
                    return new ResponseResult("Fail", "Purchase data is required");

                var existing = await _dbContext.tbl_Purchase
                    .FirstOrDefaultAsync(p => p.Id == purchase.Id && !p.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Purchase not found");

                // Vendor Validation
                var vendorExists = await _dbContext.tbl_Vendor
                    .AnyAsync(v => v.Id == purchase.VendorId && !v.IsDelete);

                if (!vendorExists)
                    return new ResponseResult("Fail", "Vendor does not exist");

                // Financial Year Validation
                var financialYear = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(f => f.Id == purchase.FinancialYearId && !f.isDelete);

                if (financialYear == null)
                    return new ResponseResult("Fail", "Financial Year does not exist");

                if (purchase.BillDate < financialYear.StartDate ||
                    purchase.BillDate > financialYear.EndDate)
                {
                    return new ResponseResult("Fail",
                        $"Bill Date must be between {financialYear.StartDate:yyyy-MM-dd} and {financialYear.EndDate:yyyy-MM-dd}");
                }

                // Duplicate BillNo
                var duplicateBill = await _dbContext.tbl_Purchase
                    .AnyAsync(p => p.BillNo == purchase.BillNo
                                && p.Id != purchase.Id
                                && !p.IsDeleted);

                if (duplicateBill)
                    return new ResponseResult("Fail", "Bill Number already exists");

                // Update Fields
                existing.VendorId = purchase.VendorId;
                existing.FinancialYearId = purchase.FinancialYearId;
                existing.EWayBillNo = purchase.EWayBillNo;
                existing.BillNo = purchase.BillNo;
                existing.BillDate = purchase.BillDate;
                existing.DueDate = purchase.DueDate;
                existing.GSTType = purchase.GSTType;
                existing.GrossAmount = purchase.GrossAmount;
                existing.GSTAmount = purchase.GSTAmount;
                existing.NetAmount = purchase.NetAmount;
                existing.Remark = purchase.Remark;
                existing.DocName = purchase.DocName;
                existing.DocUrl = purchase.DocUrl;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Purchase updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE =================
        public async Task<ResponseResult> DeletePurchase(int id)
        {
            try
            {
                var purchase = await _dbContext.tbl_Purchase
                    .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (purchase == null)
                    return new ResponseResult("Fail", "Purchase not found");

                purchase.IsDeleted = true;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Purchase deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}