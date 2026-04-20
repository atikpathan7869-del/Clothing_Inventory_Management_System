using BusinessLayer.Interface;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class VendorRepository : IVendor
    {
        private readonly ApplicationDBContext _dbContext;

        public VendorRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ SAVE VENDOR
        public async Task<ResponseResult> SaveVendor(Vendor vendor)
        {
            try
            {
                if (vendor == null)
                    return new ResponseResult("Fail", "Vendor data is required");

                var existingVendor = await _dbContext.tbl_Vendor
                    .FirstOrDefaultAsync(v =>
                        v.Name.ToLower() == vendor.Name.ToLower()
                        && !v.IsDelete);

                if (existingVendor != null)
                    return new ResponseResult("Fail", "Vendor already exists");

                vendor.IsDelete = false;

                await _dbContext.tbl_Vendor.AddAsync(vendor);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", vendor);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL VENDORS
        public async Task<ResponseResult> GetAllVendors()
        {
            try
            {
                var result = await _dbContext.tbl_Vendor.Select(o=> new
                {
                    o.IsDelete,
                    o.Name,
                    o.Id,
                    o.ContactPerson,
                    o.IFSC,
                    o.AccountHolderName,
                    o.GSTIN,
                    o.PAN,
                    o.BankAccountName,
                    o.AccountNo,
                    totalBillAmount = o.purchase.Sum(o=> (o != null ? o.NetAmount : 0)),
                    payments = o.PaymentMasters.Sum(o=> (o != null ? o.Amount : 0)),
                    dues = (o.purchase.Sum(o => (o != null ? o.NetAmount : 0)) - o.PaymentMasters.Sum(o => (o != null ? o.Amount : 0)))
                }).Where(v => !v.IsDelete).ToListAsync();

                return new ResponseResult("OK", result);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET VENDOR BY ID
        public async Task<ResponseResult> GetVendorById(int id)
        {
            try
            {
                var vendor = await _dbContext.tbl_Vendor.FirstOrDefaultAsync(v => v.Id == id && !v.IsDelete);

                if (vendor == null)
                    return new ResponseResult("Fail", "Vendor not found");

                return new ResponseResult("OK", vendor);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE VENDOR
        public async Task<ResponseResult> UpdateVendor(Vendor vendor)
        {
            try
            {
                if (vendor == null)
                    return new ResponseResult("Fail", "Vendor data is required");

                var existingVendor = await _dbContext.tbl_Vendor
                    .FirstOrDefaultAsync(v => v.Id == vendor.Id && !v.IsDelete);

                if (existingVendor == null)
                    return new ResponseResult("Fail", "Vendor not found");

                // Duplicate name check (exclude current)
                var duplicate = await _dbContext.tbl_Vendor
                    .FirstOrDefaultAsync(v =>
                        v.Name.ToLower() == vendor.Name.ToLower()
                        && v.Id != vendor.Id
                        && !v.IsDelete);

                if (duplicate != null)
                    return new ResponseResult("Fail", "Vendor name already exists");

                existingVendor.Name = vendor.Name;
                existingVendor.ContactPerson = vendor.ContactPerson;
                existingVendor.Address = vendor.Address;
                existingVendor.GSTIN = vendor.GSTIN;
                existingVendor.PAN = vendor.PAN;
                existingVendor.BankAccountName = vendor.BankAccountName;
                existingVendor.AccountNo = vendor.AccountNo;
                existingVendor.IFSC = vendor.IFSC;
                existingVendor.AccountHolderName = vendor.AccountHolderName;

                _dbContext.tbl_Vendor.Update(existingVendor);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", existingVendor);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE VENDOR (Soft Delete)
        public async Task<ResponseResult> DeleteVendor(int id)
        {
            try
            {
                var vendor = await _dbContext.tbl_Vendor
                    .FirstOrDefaultAsync(v => v.Id == id && !v.IsDelete);

                if (vendor == null)
                    return new ResponseResult("Fail", "Vendor not found");

                vendor.IsDelete = true;

                _dbContext.tbl_Vendor.Update(vendor);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Vendor deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}
