using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class ReciptMasterRepository : IReciptMaster
    {
        private readonly ApplicationDBContext _dbContext;

        public ReciptMasterRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ResponseResult> SaveRecipt(ReciptMaster model)
        {
            // Transaction start karein taaki data consistency bani rahe (Stock aur Receipt dono saath save hon)
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                // 🔹 1. Basic Validation
                if (model == null || model.ReciptItems == null || !model.ReciptItems.Any())
                    return new ResponseResult("Fail", "Receipt items are required to process inventory");

                // 🔹 2. Financial Year Validation (Must be Active and from Local Storage ID)
                var financialYear = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(f => f.Id == model.FinancialYearId && f.IsActive && !f.isDelete);

                if (financialYear == null)
                    return new ResponseResult("Fail", "Invalid or Inactive Financial Year selected. Please check your settings.");

                // 🔹 3. Staff Validation
                var staffExists = await _dbContext.tbl_StaffMaster
                    .AnyAsync(s => s.Id == model.StaffMasterId && !s.IsDeleted);
                if (!staffExists)
                    return new ResponseResult("Fail", "Selected Staff does not exist");

                // 🔥 4. AUTOMATIC INT RECEIPT NUMBER GENERATION (FY Wise)
                // Is specific FY ke liye sabse bada (Max) ReciptNo nikalte hain
                var maxReciptNo = await _dbContext.tbl_ReciptMaster
                    .Where(r => r.FinancialYearId == model.FinancialYearId && !r.IsDeleted)
                    .Select(r => (int?)r.ReciptNo) // Nullable int taaki empty table handle ho sake
                    .MaxAsync();

                // Agar max null hai (matlab is FY ki pehli entry), toh 1 assign hoga, warna Max + 1
                model.ReciptNo = (maxReciptNo ?? 0) + 1;

                // 🔹 5. Inventory Update Logic (Stock Minus)
                foreach (var item in model.ReciptItems)
                {
                    var stockItem = await _dbContext.tbl_StockMaster
                        .FirstOrDefaultAsync(s => s.Id == item.StockMasterId && !s.IsDeleted);

                    if (stockItem == null)
                        return new ResponseResult("Fail", $"Product with ID {item.StockMasterId} not found in stock");

                    // Check availability
                    if (stockItem.Qty < item.Qty)
                        return new ResponseResult("Fail", $"Insufficient stock for {stockItem.Product?.ProductName}. Available: {stockItem.Qty}");

                    // Deduct Stock
                    stockItem.Qty -= item.Qty;
                    _dbContext.tbl_StockMaster.Update(stockItem);
                }

                // 🔹 6. Receipt Master Setup & Calculations
                model.NetTotal = (model.GrossAmount + model.GSTAmount) - model.DiscountAmount;
                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                // Add to Database
                await _dbContext.tbl_ReciptMaster.AddAsync(model);

                // 🔹 7. Final Save and Commit
                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.ReciptNo,
                    model.NetTotal,
                    Message = $"Receipt #{model.ReciptNo} saved successfully for FY {financialYear.Name}"
                });
            }
            catch (Exception ex)
            {
                // Kuch bhi error aane par stock aur receipt changes rollback ho jayenge
                await transaction.RollbackAsync();
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
        // ================= GET ALL =================
        // ReciptMasterRepository.cs ke andar GetAllRecipts ko update karein
        public async Task<ResponseResult> GetAllRecipts()
        {
            try
            {
                var data = await _dbContext.tbl_ReciptMaster
                    .Where(r => !r.IsDeleted)
                    .OrderByDescending(r => r.BillDate)
                    .Select(r => new
                    {
                        r.Id,
                        r.ReciptNo,
                        r.BillDate,
                        r.GrossAmount,
                        r.DiscountAmount,
                        r.GSTAmount,
                        r.NetTotal,
                        r.CustomerName,
                        r.CustomerMobile,
                        // 🔹 Direct string mapping from child table
                        PaymentMode = r.ReciptPayments
                            .Select(p => p.PaymentMode)
                            .FirstOrDefault() ?? "Cash",
                        paid = r.ReciptPayments.Sum(S => S.Amount),
                        Staff = r.StaffMaster != null ? r.StaffMaster.Name : "N/A",
                        FinancialYear = r.FinancialYear != null ? r.FinancialYear.Name : "N/A",
                        ReciptItems = _dbContext.tbl_ReciptItem
                            .Where(item => item.ReciptMasterId == r.Id && !item.IsDeleted)
                            .Select(item => new {
                                item.Id,
                                ProductName = _dbContext.tbl_products
                                    .Where(p => p.Id == item.StockMaster!.ProductId)
                                    .Select(p => p.ProductName).FirstOrDefault(),
                                item.Qty,
                                item.Rate,
                                item.Total
                            }).ToList()
                    }).ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex) { return new ResponseResult("Fail", ex.Message); }
        }   // ================= GET BY ID =================
        public async Task<ResponseResult> GetReciptById(int id) // Yahan 'id' parameter me ReciptNo aa raha hai
        {
            try
            {
                var data = await _dbContext.tbl_ReciptMaster
                    .Where(r => r.ReciptNo == id && !r.IsDeleted) // 👈 Perfect: ReciptNo se search ho raha hai
                    .Select(r => new
                    {
                        r.Id,
                        r.ReciptNo,
                        r.BillDate,
                        r.GrossAmount,
                        r.GSTAmount,
                        r.DiscountAmount,
                        r.NetTotal,
                        r.CustomerName,
                        r.CustomerMobile,
                        // Payment Details
                        PaymentMode = _dbContext.tbl_ReciptPayment
                            .Where(p => p.ReciptMasterId == r.Id)
                            .Select(p => p.PaymentMode)
                            .FirstOrDefault() ?? "Cash",
                        Paid = _dbContext.tbl_ReciptPayment
                            .Where(p => p.ReciptMasterId == r.Id)
                            .Sum(s => (decimal?)s.Amount) ?? 0,

                        // 🔹 Items fetching using Master's Primary Key (Id)
                        ReciptItems = _dbContext.tbl_ReciptItem
                            .Where(item => item.ReciptMasterId == r.Id && !item.IsDeleted)
                            .Select(item => new {
                                item.Id,
                                // Joining with Product table for Name
                                ProductName = _dbContext.tbl_products
                                    .Where(p => p.Id == item.StockMaster!.ProductId)
                                    .Select(p => p.ProductName)
                                    .FirstOrDefault() ?? "Unknown Product",
                                item.Qty,
                                item.Rate,
                                item.Total
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (data == null) return new ResponseResult("Fail", $"Receipt No {id} not found");
                return new ResponseResult("OK", data);
            }
            catch (Exception ex) { return new ResponseResult("Fail", ex.Message); }
        }
        public async Task<ResponseResult> UpdateRecipt(ReciptMaster model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Receipt data is required");

                var existing = await _dbContext.tbl_ReciptMaster
                    .FirstOrDefaultAsync(r => r.Id == model.Id && !r.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Receipt not found");

                // 🔥 Duplicate Check (Exclude current)
                var duplicate = await _dbContext.tbl_ReciptMaster
                    .AnyAsync(r => r.ReciptNo == model.ReciptNo
                                   && r.Id != model.Id
                                   && !r.IsDeleted);

                if (duplicate)
                    return new ResponseResult("Fail", "Receipt Number already exists");

                // 🔥 Recalculate NetTotal
                existing.CustomerName = model.CustomerName;
                existing.CustomerMobile = model.CustomerMobile;
                existing.ReciptNo = model.ReciptNo;
                existing.BillDate = model.BillDate;
                existing.GrossAmount = model.GrossAmount;
                existing.GSTAmount = model.GSTAmount;
                existing.DiscountAmount = model.DiscountAmount;
                existing.NetTotal = model.GrossAmount + model.GSTAmount - model.DiscountAmount;
                
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Receipt updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE (Soft Delete) =================
        public async Task<ResponseResult> DeleteRecipt(int id)
        {
            try
            {
                var data = await _dbContext.tbl_ReciptMaster.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

                if (data == null)
                    return new ResponseResult("Fail", "Receipt not found");

                data.IsDeleted = true;
                data.UpdatedAt = DateTime.Now;
                await _dbContext.SaveChangesAsync();
                return new ResponseResult("OK", "Receipt deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= ADD DUES PAYMENT =================
        public async Task<ResponseResult> AddDuesPayment(ReciptPayment model)
        {
            try
            {
                if (model == null || model.ReciptMasterId <= 0 || model.Amount <= 0)
                    return new ResponseResult("Fail", "Invalid payment data.");

                // 1. Verify the Receipt exists
                var receipt = await _dbContext.tbl_ReciptMaster
                    .FirstOrDefaultAsync(r => r.Id == model.ReciptMasterId && !r.IsDeleted);

                if (receipt == null)
                    return new ResponseResult("Fail", "Original receipt not found.");

                // 2. Add the payment record
                // Note: Ensure your Context has 'tbl_ReciptPayment' mapped to ReciptPayment model
                model.IsDeleted = false;
                if (model.PaymentDate == default) model.PaymentDate = DateTime.Now;

                await _dbContext.tbl_ReciptPayment.AddAsync(model);

                // 3. Save Changes
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Payment updated successfully.");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}