using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class OutwardRepository : IOutward
    {
        private readonly ApplicationDBContext _dbContext;

        public OutwardRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE OUTWARD (WITH STOCK MINUS LOGIC) =================
        public async Task<ResponseResult> SaveOutward(Outword model)
        {
            // 🔹 Transaction start karein taaki agar stock update fail ho to Outward bhi save na ho
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                if (model == null || model.OutWardItems == null || !model.OutWardItems.Any())
                    return new ResponseResult("Fail", "Outward items (scanned products) are required");

                // 1. Staff Validation
                var staffExists = await _dbContext.tbl_StaffMaster
                    .AnyAsync(s => s.Id == model.StaffMasterId && !s.IsDeleted);

                if (!staffExists)
                    return new ResponseResult("Fail", "Staff user does not exist");

                // 2. Loop through each scanned item and update main stock
                foreach (var item in model.OutWardItems)
                {
                    // Item ko StockMaster table mein dhoondhein (Using StockMasterId from scanner/frontend)
                    var stockRecord = await _dbContext.tbl_StockMaster
                        .FirstOrDefaultAsync(s => s.Id == item.StockMasterId && !s.IsDeleted);

                    if (stockRecord == null)
                        return new ResponseResult("Fail", $"Product with Stock ID {item.StockMasterId} not found");

                    // Inventory Availability Check
                    if (stockRecord.Qty < item.Qty)
                        return new ResponseResult("Fail", $"Insufficient stock. Scanned: {item.Qty}, Available: {stockRecord.Qty}");

                    // 🔥 STOCK MINUS LOGIC
                    stockRecord.Qty -= item.Qty;
                    stockRecord.UpdatedAt = DateTime.Now;

                    // Update the stock record in DB context
                    _dbContext.tbl_StockMaster.Update(stockRecord);

                    // Set child item timestamps
                    item.CreatedAt = DateTime.Now;
                    item.IsDeleted = false;
                }

                // 3. Setup Outward Header
                model.CreatedAt = DateTime.Now;
                model.UpdatedAt = DateTime.Now;
                model.IsDeleted = false;

                // 4. Save to Database
                await _dbContext.Outwords.AddAsync(model); // Header and Items will be saved together
                await _dbContext.SaveChangesAsync();

                // 5. Commit Transaction
                await transaction.CommitAsync();

                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.Name,
                    model.Reason,
                    Message = "Outward recorded and stock updated successfully"
                });
            }
            catch (Exception ex)
            {
                // Kuch bhi error aane par inventory changes cancel (Rollback) ho jayenge
                await transaction.RollbackAsync();
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
        // ================= GET ALL =================
        public async Task<ResponseResult> GetAllOutwards()
        {
            try
            {
                var data = await _dbContext.Outwords
                    .Where(o => !o.IsDeleted)
                    .Select(o => new
                    {
                        o.Id,
                        o.Name,
                        o.Reason,
                        o.ContactDetails,
                        Staff = o.StaffMaster!.Name,
                        o.CreatedAt
                    })
                    .ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY ID =================
        public async Task<ResponseResult> GetOutwardById(int id)
        {
            try
            {
                var data = await _dbContext.Outwords
                    .Where(o => o.Id == id && !o.IsDeleted)
                    .Select(o => new
                    {
                        o.Id,
                        o.Name,
                        o.Reason,
                        o.ContactDetails,
                        Staff = o.StaffMaster!.Name,
                        o.CreatedAt,
                        // Items breakdown with correct casing for 'Barcode'
                        OutWardItems = o.OutWardItems.Select(item => new
                        {
                            item.Id,
                            item.StockMasterId,
                            item.Qty,
                            StockMaster = new
                            {
                                // Ensure 'Barcode' starts with Capital 'B' as per your model
                                ProductName = item.StockMaster!.Product!.ProductName,
                                Barcode = item.StockMaster.Barcode
                            }
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Outward entry not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }// ================= UPDATE =================
        public async Task<ResponseResult> UpdateOutward(Outword model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Outward data is required");

                var existing = await _dbContext.Outwords
                    .FirstOrDefaultAsync(o => o.Id == model.Id && !o.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Outward not found");

                var staffExists = await _dbContext.tbl_StaffMaster
                    .AnyAsync(s => s.Id == model.StaffMasterId && !s.IsDeleted);

                if (!staffExists)
                    return new ResponseResult("Fail", "Staff does not exist");

                existing.Name = model.Name;
                existing.Reason = model.Reason;
                existing.ContactDetails = model.ContactDetails;
                existing.StaffMasterId = model.StaffMasterId;
                existing.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Outward updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE (Soft Delete) =================
        public async Task<ResponseResult> DeleteOutward(int id)
        {
            try
            {
                var data = await _dbContext.Outwords
                    .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

                if (data == null)
                    return new ResponseResult("Fail", "Outward not found");

                data.IsDeleted = true;
                data.UpdatedAt = DateTime.UtcNow;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Outward deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}