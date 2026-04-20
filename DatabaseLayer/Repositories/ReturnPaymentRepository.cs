using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class ReturnPaymentRepository : IReturnPayment
    {
        private readonly ApplicationDBContext _dbContext;

        public ReturnPaymentRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE =================
        public async Task<ResponseResult> SaveReturnPayment(ReturnPayment model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Return payment data is required");

                if (model.Amount <= 0)
                    return new ResponseResult("Fail", "Refund amount must be greater than zero");

                var salesReturn = await _dbContext.tbl_SalesReturn
                    .FirstOrDefaultAsync(s => s.Id == model.SalesReturnId && !s.IsDeleted);

                if (salesReturn == null)
                    return new ResponseResult("Fail", "Sales Return not found");

                // 🔥 Calculate Already Refunded Amount
                var totalRefunded = await _dbContext.tbl_ReturnPayment
                    .Where(r => r.SalesReturnId == model.SalesReturnId && !r.IsDeleted)
                    .SumAsync(r => (decimal?)r.Amount) ?? 0;

                if (totalRefunded + model.Amount > salesReturn.NetAmount)
                {
                    return new ResponseResult("Fail",
                        $"Refund exceeds return amount. Available: {salesReturn.NetAmount - totalRefunded}");
                }

                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_ReturnPayment.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.SalesReturnId,
                    model.PaymentType,
                    model.Amount,
                    model.PaidDate,
                    RemainingRefund =
                        salesReturn.NetAmount - (totalRefunded + model.Amount)
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }

        // ================= GET ALL =================
        public async Task<ResponseResult> GetAllReturnPayments()
        {
            try
            {
                var data = await _dbContext.tbl_ReturnPayment
                    .Where(r => !r.IsDeleted)
                    .Select(r => new
                    {
                        r.Id,
                        r.SalesReturnId,
                        r.PaymentType,
                        r.Reference,
                        r.Amount,
                        r.PaidDate
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
        public async Task<ResponseResult> GetReturnPaymentById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_ReturnPayment
                    .Where(r => r.Id == id && !r.IsDeleted)
                    .Select(r => new
                    {
                        r.Id,
                        r.SalesReturnId,
                        r.PaymentType,
                        r.Reference,
                        r.Amount,
                        r.PaidDate
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Return payment not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY SALES RETURN =================
        public async Task<ResponseResult> GetReturnPaymentsBySalesReturnId(int salesReturnId)
        {
            try
            {
                var data = await _dbContext.tbl_ReturnPayment
                    .Where(r => r.SalesReturnId == salesReturnId && !r.IsDeleted)
                    .Select(r => new
                    {
                        r.Id,
                        r.PaymentType,
                        r.Amount,
                        r.PaidDate
                    })
                    .ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE (SOFT DELETE) =================
        public async Task<ResponseResult> DeleteReturnPayment(int id)
        {
            try
            {
                var existing = await _dbContext.tbl_ReturnPayment
                    .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Return payment not found");

                existing.IsDeleted = true;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Return payment deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}