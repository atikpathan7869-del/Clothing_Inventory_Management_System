using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class Financial_YearRepository : IFinancial_year
    {
        private readonly ApplicationDBContext _dbContext;

        public Financial_YearRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ================= SAVE =================
        public async Task<ResponseResult> saveFinancialyear(Financial_year FY)
        {
            try
            {
                if (FY == null)
                    return new ResponseResult("Fail", "Financial Year data required");

                // Duplicate Check
                if (await _dbContext.tbl_Financial_Year
                    .AnyAsync(x => x.Name == FY.Name && !x.isDelete))
                {
                    return new ResponseResult("Fail", "Financial Year already exists");
                }

                // Agar new FY active hai to baaki inactive karo
                if (FY.IsActive)
                {
                    var activeYears = await _dbContext.tbl_Financial_Year
                        .Where(x => x.IsActive && !x.isDelete)
                        .ToListAsync();

                    foreach (var item in activeYears)
                    {
                        item.IsActive = false;
                    }
                }

                FY.CreatedAt = DateTime.Now;
                FY.isDelete = false;

                await _dbContext.tbl_Financial_Year.AddAsync(FY);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", FY);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= LIST =================
        public async Task<ResponseResult> listFinancialyear()
        {
            try
            {
                var data = await _dbContext.tbl_Financial_Year
                    .Where(x => !x.isDelete)
                    .Select(x => new
                    {
                        x.Id,
                        x.Name,
                        x.StartDate,
                        x.EndDate,
                        x.IsActive,
                        x.CreatedAt
                    })
                    .ToListAsync();

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DETAIL =================
        public async Task<ResponseResult> detailFinancialyear(int id)
        {
            try
            {
                var data = await _dbContext.tbl_Financial_Year
                    .Where(x => x.Id == id && !x.isDelete)
                    .Select(x => new
                    {
                        x.Id,
                        x.Name,
                        x.StartDate,
                        x.EndDate,
                        x.IsActive,
                        x.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Financial Year not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= UPDATE =================
        public async Task<ResponseResult> updateFinancialyear(Financial_year FY, int id)
        {
            try
            {
                var existing = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(x => x.Id == id && !x.isDelete);

                if (existing == null)
                    return new ResponseResult("Fail", "Financial Year not found");

                // Duplicate check
                if (await _dbContext.tbl_Financial_Year
                    .AnyAsync(x => x.Name == FY.Name && x.Id != id && !x.isDelete))
                {
                    return new ResponseResult("Fail", "Financial Year already exists");
                }

                // Agar active kar rahe ho to dusre deactivate
                if (FY.IsActive)
                {
                    var activeYears = await _dbContext.tbl_Financial_Year
                        .Where(x => x.IsActive && x.Id != id && !x.isDelete)
                        .ToListAsync();

                    foreach (var item in activeYears)
                    {
                        item.IsActive = false;
                    }
                }

                existing.Name = FY.Name;
                existing.StartDate = FY.StartDate;
                existing.EndDate = FY.EndDate;
                existing.IsActive = FY.IsActive;
                existing.UpdateAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Financial Year updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE =================
        public async Task<ResponseResult> deleteFinancialyear(int id)
        {
            try
            {
                var FY = await _dbContext.tbl_Financial_Year
                    .FirstOrDefaultAsync(x => x.Id == id && !x.isDelete);

                if (FY == null)
                    return new ResponseResult("Fail", "Financial Year not found");

                FY.isDelete = true;
                FY.UpdateAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Financial Year deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        public Task<ResponseResult> updateFinancialyear(int id)
        {
            throw new NotImplementedException();
        }
    }
}