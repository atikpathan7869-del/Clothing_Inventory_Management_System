using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class PurchasePaymentRepository : IPurchasePayment
    {
        private readonly ApplicationDBContext _dbContext;

        public PurchasePaymentRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ ADD PURCHASE PAYMENT (With Amount Validation)
        public async Task<ResponseResult> SavePurchasePayment(PurchasePayment model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "PurchasePayment data is required");

                var purchase = await _dbContext.tbl_Purchase
                    .FirstOrDefaultAsync(p => p.Id == model.PurchaseId);

                if (purchase == null)
                    return new ResponseResult("Fail", "Invalid PurchaseId");

                var paymentMaster = await _dbContext.tbl_PaymentMaster
                    .FirstOrDefaultAsync(p => p.Id == model.PaymentMasterId);

                if (paymentMaster == null)
                    return new ResponseResult("Fail", "Invalid PaymentMasterId");

                var existingTotal = await _dbContext.tbl_PurchasePayment
                    .Where(p => p.PaymentMasterId == model.PaymentMasterId && !p.IsDeleted)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                if (existingTotal + model.Amount > paymentMaster.Amount)
                {
                    return new ResponseResult("Fail",
                        $"Payment limit exceeded. Available balance: {paymentMaster.Amount - existingTotal}");
                }

                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_PurchasePayment.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                // ✅ Return Clean Response (NO Entity)
                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.Amount,
                    model.CreatedAt,
                    model.PurchaseId,
                    PurchaseBillNo = purchase.BillNo,
                    model.PaymentMasterId,
                    PaymentAmount = paymentMaster.Amount,
                    PaymentMode = paymentMaster.PaymentMode
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL PURCHASE PAYMENTS
        public async Task<ResponseResult> GetAllPurchasePayments()
        {
            try
            {
                var data = await _dbContext.tbl_PurchasePayment
                    .Where(p => !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.CreatedAt,

                        Purchase = new
                        {
                            p.Purchase!.Id,
                            p.Purchase.BillNo,
                            p.Purchase.BillDate,
                            p.Purchase.VendorId,
                            p.Purchase.Vendor!.Name,


                        },

                        PaymentMaster = new
                        {
                            p.PaymentMaster!.Id,
                            p.PaymentMaster.Amount,
                            p.PaymentMaster.PaymentMode
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

        // ✅ GET PURCHASE PAYMENT BY ID
        public async Task<ResponseResult> GetPurchasePaymentById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_PurchasePayment
                    .Where(p => p.Id == id && !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.CreatedAt,

                        Purchase = new
                        {
                            p.Purchase.Id,
                            p.Purchase.BillDate
                        },

                        PaymentMaster = new
                        {
                            p.PaymentMaster.Id,
                            p.PaymentMaster.Amount,
                            p.PaymentMaster.PaymentMode
                        }
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "PurchasePayment not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE PURCHASE PAYMENT
        public async Task<ResponseResult> UpdatePurchasePayment(PurchasePayment model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "PurchasePayment data is required");

                var existing = await _dbContext.tbl_PurchasePayment
                    .FirstOrDefaultAsync(p => p.Id == model.Id && !p.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "PurchasePayment not found");

                var purchaseExists = await _dbContext.tbl_Purchase
                    .AnyAsync(p => p.Id == model.PurchaseId);

                if (!purchaseExists)
                    return new ResponseResult("Fail", "Invalid PurchaseId");

                var paymentMasterExists = await _dbContext.tbl_PaymentMaster
                    .AnyAsync(p => p.Id == model.PaymentMasterId);

                if (!paymentMasterExists)
                    return new ResponseResult("Fail", "Invalid PaymentMasterId");

                existing.Amount = model.Amount;
                existing.PurchaseId = model.PurchaseId;
                existing.PaymentMasterId = model.PaymentMasterId;
                existing.UpdatedAt = DateTime.Now;

                _dbContext.tbl_PurchasePayment.Update(existing);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", existing);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE PURCHASE PAYMENT (Soft Delete)
        public async Task<ResponseResult> DeletePurchasePayment(int id)
        {
            try
            {
                var data = await _dbContext.tbl_PurchasePayment
                    .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (data == null)
                    return new ResponseResult("Fail", "PurchasePayment not found");

                data.IsDeleted = true;
                data.UpdatedAt = DateTime.Now;

                _dbContext.tbl_PurchasePayment.Update(data);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "PurchasePayment deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}