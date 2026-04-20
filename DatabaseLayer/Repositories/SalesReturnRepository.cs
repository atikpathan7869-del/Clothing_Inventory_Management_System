using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class SalesReturnRepository : ISalesReturn
    {
        private readonly ApplicationDBContext _dbContext;

        public SalesReturnRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE =================
        // ================= SAVE =================
        public async Task<ResponseResult> SaveSalesReturn(SalesReturn model)
        {
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "SalesReturn data is required");

                // 🔹 1. Validation
                var receipt = await _dbContext.tbl_ReciptMaster
                    .FirstOrDefaultAsync(r => r.Id == model.ReciptMasterId && !r.IsDeleted);

                if (receipt == null) return new ResponseResult("Fail", "Original Receipt not found");

                // 🔹 2. Set Audit Fields
                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                // 🔹 3. Add Sales Return to DB
                // Ye line ReturnItems aur Payments dono save kar degi
                await _dbContext.tbl_SalesReturn.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                // 🔹 4. STOCK LOGIC (Bina kisi extra table ke)
                foreach (var item in model.SalesReturn_Items)
                {
                    // Pehle ReciptItem se StockMasterId nikalte hain
                    var originalItem = await _dbContext.tbl_ReciptItem
                        .FirstOrDefaultAsync(x => x.Id == item.ReciptItemId);

                    if (originalItem != null)
                    {
                        var stock = await _dbContext.tbl_StockMaster.FindAsync(originalItem.StockMasterId);

                        if (stock != null)
                        {
                            // LOGIC: 
                            // Agar Qty POSITIVE (+) hai -> Matlab Return (Stock badhao)
                            // Agar Qty NEGATIVE (-) hai -> Matlab Exchange/New Item (Stock kam karo)

                            stock.Qty += item.Qty;

                            _dbContext.tbl_StockMaster.Update(stock);
                        }
                    }
                }

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return new ResponseResult("OK", new { model.Id, ReceiptNo = receipt.ReciptNo });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
        // ================= GET ALL =================
        public async Task<ResponseResult> GetAllSalesReturns()
{
    try
    {
        var data = await _dbContext.tbl_SalesReturn
            .Where(r => !r.IsDeleted)
            .Select(r => new
            {
                r.Id,
                r.ReturnDate,
                r.ReturnType,
                r.NetAmount,
                r.GrossAmount,
                r.DiscountAmount,
                r.Reason,
                r.Remark,
                // Pure StaffMaster ki jagah sirf name bhein
                StaffName = r.StaffMaster != null ? r.StaffMaster.Name : "N/A", 
                // Pure ReciptMaster ki jagah ReceiptNo bhein
                ReceiptNo = r.ReciptMaster != null ? r.ReciptMaster.ReciptNo.ToString() : "N/A",
                CustomerName = r.ReciptMaster != null ? r.ReciptMaster.CustomerName : "Walk-in",
                
                Items = r.SalesReturn_Items!.Select(s => new
                {
                    ProductName = s.ReciptItem!.StockMaster!.Product!.ProductName,
                    s.Qty,
                    Price = s.ReciptItem.Rate
                }).ToList(),
                
                r.ReciptMasterId,
                r.StaffMasterId
            })
            .ToListAsync();

        return new ResponseResult("OK", data);
    }
    catch (Exception ex)
    {
        // Inner exception check karna zaroori hai details ke liye
        return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
    }
}
        // ================= GET BY ID =================
        public async Task<ResponseResult> GetSalesReturnById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_SalesReturn
                    .Where(r => r.Id == id && !r.IsDeleted)
                    .Select(r => new
                    {
                        r.Id,
                        r.ReturnDate,
                        r.ReturnType,
                        r.GrossAmount,
                        r.GSTAmount,
                        r.DiscountAmount,
                        r.NetAmount,
                        r.Reason,
                        r.Remark,
                        ReceiptNo = r.ReciptMaster!.ReciptNo,
                        StaffName = r.StaffMaster!.Name
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "SalesReturn not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY RECEIPT NO (FIXED LOGIC) =================
        public async Task<ResponseResult> GetSalesReturnsByReceiptId(int ReciptNo, int FinancialYearId)
        {
            try
            {
                var data = await _dbContext.tbl_ReciptMaster
                    .Where(r => r.ReciptNo == ReciptNo && r.FinancialYearId == FinancialYearId && !r.IsDeleted)
                    .Select(r => new
                    {
                        r.Id,
                        r.ReciptNo,
                        r.BillDate,
                        r.CustomerName,
                        r.CustomerMobile,
                        r.NetTotal,
                        items = r.ReciptItems!.Select(S => new
                        {
                            S.Id,
                            S.Rate,
                            OriginalQty = S.Qty,
                            // FIX: Filter by ReciptItemId instead of StockMasterId
                            AlreadyReturnedQty = _dbContext.tbl_SalesReturn_Item
                                .Where(ri => ri.ReciptItemId == S.Id && !ri.SalesReturn!.IsDeleted)
                                .Sum(ri => (int?)ri.Qty) ?? 0,

                            Qty = S.Qty - (_dbContext.tbl_SalesReturn_Item
                                .Where(ri => ri.ReciptItemId == S.Id && !ri.SalesReturn!.IsDeleted)
                                .Sum(ri => (int?)ri.Qty) ?? 0),

                            ProductName = S.StockMaster!.Product!.ProductName,
                            S.Amount,
                            S.DiscountPer,
                            S.DiscountAmount,
                            S.GSTPer,
                            S.GSTAmount,
                            S.Total,
                            S.StockMasterId
                        }).ToList(),
                        r.GrossAmount,
                        r.GSTAmount,
                        r.DiscountAmount,
                        r.StaffMasterId
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Bill not found for this number.");

                // Filter: Only show items that have remaining quantity > 0
                var filteredItems = data.items.Where(i => i.Qty > 0).ToList();

                if (filteredItems.Count == 0)
                    return new ResponseResult("Fail", "Is bill ke saare items pehle hi return ho chuke hain.");

                return new ResponseResult("OK", new
                {
                    data.Id,
                    data.ReciptNo,
                    data.BillDate,
                    data.CustomerName,
                    data.CustomerMobile,
                    data.NetTotal,
                    items = filteredItems,
                    data.GrossAmount,
                    data.GSTAmount,
                    data.DiscountAmount,
                    data.StaffMasterId
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }// ================= UPDATE =================
        public async Task<ResponseResult> UpdateSalesReturn(SalesReturn model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "SalesReturn data is required");

                var existing = await _dbContext.tbl_SalesReturn
                    .FirstOrDefaultAsync(r => r.Id == model.Id && !r.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "SalesReturn not found");

                existing.ReturnType = model.ReturnType;
                existing.ReturnDate = model.ReturnDate;
                existing.GrossAmount = model.GrossAmount;
                existing.GSTAmount = model.GSTAmount;
                existing.DiscountAmount = model.DiscountAmount;
                existing.NetAmount = model.NetAmount;
                existing.Reason = model.Reason;
                existing.Remark = model.Remark;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "SalesReturn updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE (SOFT DELETE) =================
        public async Task<ResponseResult> DeleteSalesReturn(int id)
        {
            try
            {
                var existing = await _dbContext.tbl_SalesReturn
                    .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "SalesReturn not found");

                existing.IsDeleted = true;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "SalesReturn deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= NEW: GET BY MOBILE =================
        public async Task<ResponseResult> GetSalesReturnsByMobile(string MobileNo, int FinancialYearId)
        {
            try
            {
                // 🔹 Step 1: Pehle Original Bill dhoondo jo return ke liye available ho
                var bills = await _dbContext.tbl_ReciptMaster
                    .Where(r => r.CustomerMobile == MobileNo &&
                                r.FinancialYearId == FinancialYearId &&
                                !r.IsDeleted)
                    .Select(r => new
                    {
                        r.Id,
                        r.ReciptNo,
                        BillDate = r.BillDate, // Make sure column name matches
                        r.CustomerName,
                        r.CustomerMobile,
                        r.NetTotal,
                        // Items calculation (Same logic as GetByReceiptId)
                        items = r.ReciptItems!.Select(S => new
                        {
                            S.Id,
                            S.Rate,
                            Qty = S.Qty - (_dbContext.tbl_SalesReturn_Item
                                .Where(ri => ri.ReciptItem!.StockMaster!.Id == S.StockMasterId && !ri.SalesReturn!.IsDeleted)
                                .Sum(ri => (int?)ri.Qty) ?? 0),
                            ProductName = S.StockMaster!.Product!.ProductName,
                            S.GSTPer,
                            S.StockMasterId
                        }).Where(i => i.Qty > 0).ToList() // Sirf wo items jo return ho sakein
                    })
                    .Where(b => b.items.Count > 0) // Sirf wo bills jisme returnable items bache hon
                    .ToListAsync();

                if (bills.Count == 0)
                    return new ResponseResult("Fail", "No returnable invoices found for this mobile number.");

                return new ResponseResult("OK", bills);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
        public async Task<ResponseResult> SaveSalesReturnExchange(SalesReturn model)
{
    using var transaction = await _dbContext.Database.BeginTransactionAsync();
    try
    {
        if (model == null)
            return new ResponseResult("Fail", "Data is required");

        // 1. Audit & Basic Setup
        model.CreatedAt = DateTime.Now;
        model.IsDeleted = false;

        // 2. Add the main record (Items & Payments will auto-save if using EF Navigation)
        await _dbContext.tbl_SalesReturn.AddAsync(model);
        await _dbContext.SaveChangesAsync();

        // 3. Process Stock for every item in the exchange
        foreach (var item in model.SalesReturn_Items)
        {
            // Find the stock record
            var stock = await _dbContext.tbl_StockMaster.FindAsync(item.Id);

            if (stock != null)
            {
                /* LOGIC EXPLAINED:
                   - Return Item: User sends Qty = 2.  Stock (10) + 2 = 12.
                   - Exchange Item: User sends Qty = -1. Stock (12) + (-1) = 11.
                */
                stock.Qty += item.Qty; 
                _dbContext.tbl_StockMaster.Update(stock);
            }
        }

        await _dbContext.SaveChangesAsync();
        await transaction.CommitAsync();

        return new ResponseResult("OK", new { model.Id });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
    }
}

    }
}