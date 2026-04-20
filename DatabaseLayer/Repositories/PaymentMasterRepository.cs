using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class PaymentMasterRepository : IPaymentMaster
    {
        private readonly ApplicationDBContext _dbContext;

        public PaymentMasterRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ ADD PAYMENT
        public async Task<ResponseResult> AddPayment(PaymentMaster model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Payment data is required");

                var vendorExists = await _dbContext.tbl_Vendor
                    .AnyAsync(v => v.Id == model.VendorId);

                if (!vendorExists)
                    return new ResponseResult("Fail", "Invalid VendorId");

                var financialYearExists = await _dbContext.tbl_Financial_Year
                    .AnyAsync(f => f.Id == model.FinancialYearId);

                if (!financialYearExists)
                    return new ResponseResult("Fail", "Invalid FinancialYearId");

                model.CreatedAt = DateTime.Now;

                await _dbContext.tbl_PaymentMaster.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                var purchases = await _dbContext.tbl_Purchase
                    .Where(o => o.VendorId == model.VendorId)
                    .Select(o => new
                    {
                        paid = o.PurchasePayments.Sum(p => (decimal?)p.Amount ?? 0),
                        dues = o.NetAmount - o.PurchasePayments.Sum(p => (decimal?)p.Amount ?? 0),
                        o.Id,
                        o.BillDate
                    })
                    .Where(o => o.dues > 0)
                    .OrderBy(o => o.BillDate)
                    .ToListAsync();

                decimal amount = model.Amount;

                List<PurchasePayment> purchasePayments = new();

                foreach (var item in purchases)
                {
                    if (amount <= 0)
                        break;

                    decimal payAmount = amount >= item.dues ? item.dues : amount;

                    purchasePayments.Add(new PurchasePayment
                    {
                        PurchaseId = item.Id,
                        PaymentMasterId = model.Id,
                        Amount = payAmount,
                        IsDeleted = false
                    });

                    amount -= payAmount;
                }

                if (purchasePayments.Any())
                {
                    await _dbContext.tbl_PurchasePayment.AddRangeAsync(purchasePayments);
                    await _dbContext.SaveChangesAsync();
                }

                return new ResponseResult("OK", "Save Successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL PAYMENTS
        public async Task<ResponseResult> GetAllPayments()
        {
            try
            {
                var data = await _dbContext.tbl_PaymentMaster
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.Remark,
                        p.PaymentDate,

                        Vendor = new
                        {
                            p.Vendor!.Id,
                            p.Vendor!.Name
                        },

                        FinancialYear = new
                        {
                            p!.FinancialYear!.Id,
                            p!.FinancialYear!.Name
                        }
                    }).ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        public async Task<ResponseResult> getPaymentDues()
        {
            try
            {
                var data = await _dbContext.tbl_PaymentMaster
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.Remark,
                        p.PaymentDate,

                        Vendor = new
                        {
                            p.Vendor!.Id,
                            p.Vendor!.Name
                        },

                        FinancialYear = new
                        {
                            p!.FinancialYear!.Id,
                            p!.FinancialYear!.Name
                        }
                    }).ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }



        public async Task<ResponseResult> getBalanceSheet(int VendorId)
        {
            try
            {
                var financialYear = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(o => o.IsActive == true);

                if (financialYear == null)
                {
                    return new ResponseResult("Fail", "Financial Year is not selected");
                }

                var paymentsTotal = await _dbContext.tbl_PaymentMaster
                    .Where(o => o.FinancialYearId < financialYear.Id && o.VendorId == VendorId)
                    .SumAsync(o => (decimal?)o.Amount ?? 0);

                var purchasesTotal = await _dbContext.tbl_Purchase
                    .Where(o => o.FinancialYearId < financialYear.Id && o.VendorId == VendorId)
                    .SumAsync(o => (decimal?)o.NetAmount ?? 0);

                var openingBalance = purchasesTotal - paymentsTotal;

                var balanceSheet = await _dbContext.tbl_Vendor
                    .Where(v => v.Id == VendorId)
                    .Select(v => new
                    {
                        v.Id,
                        v.Name,
                        v.ContactPerson,
                        v.Address,
                        v.GSTIN,
                        v.PAN,

                        purchases = v.purchase
                            .Where(p => p.FinancialYearId == financialYear.Id)
                            .OrderBy(p => p.BillDate)
                            .Select(p => new
                            {
                                p.Id,
                                p.BillNo,
                                p.BillDate,
                                p.NetAmount
                            }),

                        payments = v.PaymentMasters
                            .Where(p => p.FinancialYearId == financialYear.Id)
                            .OrderBy(p => p.PaymentDate)
                            .Select(p => new
                            {
                                p.Id,
                                p.Amount,
                                p.PaymentMode,
                                p.Reference,
                                p.PaymentDate
                            })
                    })
                    .FirstOrDefaultAsync();

                return new ResponseResult("OK", new
                {
                    openingBalance,
                    balanceSheet
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
        // ✅ GET PAYMENT BY ID
        public async Task<ResponseResult> GetPaymentById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_PaymentMaster
                    .Where(p => p.Id == id)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.Remark,
                        p.PaymentDate,

                        Vendor = new
                        {
                            p.Vendor.Id,
                            p.Vendor.Name
                        },

                        FinancialYear = new
                        {
                            p.FinancialYear.Id,
                            p.FinancialYear.Name
                        }
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail","Payment not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE PAYMENT
        public async Task<ResponseResult> UpdatePayment(PaymentMaster model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Payment data is required");

                var existing = await _dbContext.tbl_PaymentMaster
                    .FirstOrDefaultAsync(p => p.Id == model.Id);

                if (existing == null)
                    return new ResponseResult("Fail", "Payment not found");

                var vendorExists = await _dbContext.tbl_Vendor
                    .AnyAsync(v => v.Id == model.VendorId);

                if (!vendorExists)
                    return new ResponseResult("Fail", "Invalid VendorId");

                var financialYearExists = await _dbContext.tbl_Financial_Year
                    .AnyAsync(f => f.Id == model.FinancialYearId);

                if (!financialYearExists)
                    return new ResponseResult("Fail", "Invalid FinancialYearId");

                existing.Amount = model.Amount;
                existing.VendorId = model.VendorId;
                existing.PaymentMode = model.PaymentMode;
                existing.Reference = model.Reference;
                existing.Remark = model.Remark;
                existing.PaymentDate = model.PaymentDate;
                existing.FinancialYearId = model.FinancialYearId;
                existing.UpdatedAt = DateTime.Now;

                _dbContext.tbl_PaymentMaster.Update(existing);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", existing);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE PAYMENT (Hard Delete)
        public async Task<ResponseResult> DeletePayment(int id)
        {
            try
            {
                var payment = await _dbContext.tbl_PaymentMaster
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (payment == null)
                    return new ResponseResult("Fail", "Payment not found");

                _dbContext.tbl_PaymentMaster.Remove(payment);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Payment deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET BY VENDOR
        public async Task<ResponseResult> GetPaymentsByVendorId(int vendorId)
        {
            try
            {
                var data = await _dbContext.tbl_PaymentMaster
                    .Where(p => p.VendorId == vendorId)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.Remark,
                        p.PaymentDate,

                        FinancialYear = new
                        {
                            p.FinancialYear!.Id,
                            p.FinancialYear.Name
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

        // ✅ GET BY FINANCIAL YEAR
        public async Task<ResponseResult> GetPaymentsByFinancialYearId(int financialYearId)
        {
            try
            {
                var data = await _dbContext.tbl_PaymentMaster
                    .Where(p => p.FinancialYearId == financialYearId)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.Remark,
                        p.PaymentDate,
                        Vendor = new
                        {
                            p!.Vendor!.Id,
                            p!.Vendor!.Name
                        }
                    }).ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}