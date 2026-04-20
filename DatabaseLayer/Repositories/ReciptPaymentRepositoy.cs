using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class ReciptPaymentRepositoy : IReciptPayment
    {
        private readonly ApplicationDBContext _dbContext;

        public ReciptPaymentRepositoy(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE =================
        public async Task<ResponseResult> SaveReciptPayment(ReciptPayment model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Payment data is required");

                var receipt = await _dbContext.tbl_ReciptMaster
                    .FirstOrDefaultAsync(r => r.Id == model.ReciptMasterId && !r.IsDeleted);

                if (receipt == null)
                    return new ResponseResult("Fail", "Receipt not found");

                var financialYear = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(f => f.Id == model.FinancialYearId && !f.isDelete);

                if (financialYear == null)
                    return new ResponseResult("Fail", "Financial Year not found");

                if (model.PaymentDate < financialYear.StartDate ||
                    model.PaymentDate > financialYear.EndDate)
                {
                    return new ResponseResult("Fail",
                        $"Payment Date must be between {financialYear.StartDate:yyyy-MM-dd} and {financialYear.EndDate:yyyy-MM-dd}");
                }

                var existingTotal = await _dbContext.tbl_ReciptPayment
                    .Where(p => p.ReciptMasterId == model.ReciptMasterId && !p.IsDeleted)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                if (existingTotal + model.Amount > receipt.NetTotal)
                {
                    return new ResponseResult("Fail",
                        $"Payment exceeds remaining balance. Available: {receipt.NetTotal - existingTotal}");
                }

                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_ReciptPayment.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.Amount,
                    model.PaymentMode,
                    model.PaymentDate,
                    RemainingBalance = receipt.NetTotal - (existingTotal + model.Amount)
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }

        // ================= GET ALL =================
        public async Task<ResponseResult> GetAllReciptPayments()
        {
            try
            {
                var data = await _dbContext.tbl_ReciptPayment
                    .Where(p => !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.PaymentDate,
                        ReceiptNo = p.ReciptMaster!.ReciptNo
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
        public async Task<ResponseResult> GetReciptPaymentById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_ReciptPayment
                    .Where(p => p.Id == id && !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.PaymentDate,
                        p.Remark
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Payment not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY RECEIPT =================
        public async Task<ResponseResult> GetReciptPaymentsByReciptId(int reciptMasterId)
        {
            try
            {
                var data = await _dbContext.tbl_ReciptPayment
                    .Where(p => p.ReciptMasterId == reciptMasterId && !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.Amount,
                        p.PaymentMode,
                        p.Reference,
                        p.PaymentDate
                    })
                    .ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= UPDATE =================
        public async Task<ResponseResult> UpdateReciptPayment(ReciptPayment model)
        {
            try
            {
                var existing = await _dbContext.tbl_ReciptPayment
                    .FirstOrDefaultAsync(p => p.Id == model.Id && !p.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Payment not found");

                existing.Amount = model.Amount;
                existing.PaymentMode = model.PaymentMode;
                existing.Reference = model.Reference;
                existing.Remark = model.Remark;
                existing.PaymentDate = model.PaymentDate;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Payment updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE (Soft Delete) =================
        public async Task<ResponseResult> DeleteReciptPayment(int id)
        {
            try
            {
                var data = await _dbContext.tbl_ReciptPayment
                    .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (data == null)
                    return new ResponseResult("Fail", "Payment not found");

                data.IsDeleted = true;
                data.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Payment deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}