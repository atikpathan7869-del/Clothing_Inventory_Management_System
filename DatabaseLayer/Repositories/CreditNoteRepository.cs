using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class CreditNoteRepository : ICreditNote
    {
        private readonly ApplicationDBContext _dbContext;

        public CreditNoteRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= CREATE =================
        public async Task<ResponseResult> SaveCreditNote(CreditNote model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Credit note data is required");

                if (model.Amount <= 0)
                    return new ResponseResult("Fail", "Credit amount must be greater than zero");

                // 🔹 SalesReturn Validation
                var salesReturn = await _dbContext.tbl_SalesReturn
                    .FirstOrDefaultAsync(s => s.Id == model.SalesReturnId && !s.IsDeleted);

                if (salesReturn == null)
                    return new ResponseResult("Fail", "Sales Return not found");

                // 🔹 Amount Validation
                if (model.Amount > salesReturn.NetAmount)
                    return new ResponseResult("Fail", "Credit amount cannot exceed Sales Return amount");

                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_CreditNote.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {   
                    model.Id,
                    model.SalesReturnId,
                    model.Amount,
                    model.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.InnerException?.Message ?? ex.Message);
            }
        }
        // ================= GET BY MOBILE =================
        public async Task<ResponseResult> GetCreditByMobile(string mobile)
        {
            try
            {
                // 1. Pehle Sales Return table se is mobile ki saari active returns nikaalein
                // 2. Phir check karein ki kya in returns ka Credit Note 'tbl_CreditNote' mein hai aur 'IsUsed' false hai
                var availableCredit = await (from sr in _dbContext.tbl_SalesReturn
                                             join cn in _dbContext.tbl_CreditNote on sr.Id equals cn.SalesReturnId
                                             where sr.ReciptMaster!.CustomerMobile == mobile
                                              // Sirf wahi jo use nahi huye
                                             && !cn.IsDeleted
                                             select cn).FirstOrDefaultAsync();

                if (availableCredit == null)
                    return new ResponseResult("Fail", "No active credit note found for this mobile");

                return new ResponseResult("OK", new
                {
                    Id = availableCredit.Id,
                    Amount = availableCredit.Amount
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}