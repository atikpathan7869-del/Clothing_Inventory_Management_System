using BusinessLayer.Interface;
using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DatabaseLayer.Repositories
{
    public class StaffMasterRepository : IStaffMaster
    {
        private readonly ApplicationDBContext _dbContext;

        public StaffMasterRepository(ApplicationDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        // ✅ LOGIN STAFF (New method for your Login Screen)
        // ✅ LOGIN STAFF (Supports Email or Username)
        public async Task<ResponseResult> LoginStaff(string identifier, string password)
        {
            try
            {
                // Logic: Check if Identifier matches Email OR Username
                var staff = await _dbContext.tbl_StaffMaster
                    .Where(x => !x.IsDeleted &&
                                x.Password == password &&
                                (x.Email == identifier || x.Username == identifier))
                    .Select(x => new
                    {
                        x.Id,
                        x.Name,
                        x.Email,
                        x.Username,
                        x.ContactNo,
                        x.Role,
                        x.Gender
                    })
                    .FirstOrDefaultAsync();

                if (staff == null)
                    return new ResponseResult("Fail", "Invalid Credentials (Email/Username or Password)");

                return new ResponseResult("OK", staff);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
        // ✅ SAVE STAFF (Includes Username & Password)
        public async Task<ResponseResult> SaveStaff(StaffMaster model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Staff data is required");

                // 🔎 Duplicate Username Check
                if (await _dbContext.tbl_StaffMaster.AnyAsync(x => x.Username == model.Username && !x.IsDeleted))
                {
                    return new ResponseResult("Fail", "Username already exists");
                }

                // 🔎 Duplicate Email Check
                if (await _dbContext.tbl_StaffMaster.AnyAsync(x => x.Email == model.Email && !x.IsDeleted))
                {
                    return new ResponseResult("Fail", "Email already exists");
                }

                // 🔎 Duplicate Contact Check
                if (await _dbContext.tbl_StaffMaster.AnyAsync(x => x.ContactNo == model.ContactNo && !x.IsDeleted))
                {
                    return new ResponseResult("Fail", "Contact number already exists");
                }

                model.CreatedAt = DateTime.Now;
                model.IsDeleted = false;

                await _dbContext.tbl_StaffMaster.AddAsync(model);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {
                    model.Id,
                    model.Name,
                    model.Username,
                    model.Role
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ GET ALL STAFF
        public async Task<ResponseResult> GetAllStaff()
        {
            try
            {
                var data = await _dbContext.tbl_StaffMaster
                    .Where(x => !x.IsDeleted)
                    .Select(x => new
                    {
                        x.Id,
                        x.Name,
                        x.Username, // Added
                        x.Email,
                        x.ContactNo,
                        x.Gender,
                        x.Role,
                        x.DOJ,
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

        // ✅ GET STAFF BY ID
        public async Task<ResponseResult> GetStaffById(int id)
        {
            try
            {
                var data = await _dbContext.tbl_StaffMaster
                    .Where(x => x.Id == id && !x.IsDeleted)
                    .Select(x => new
                    {
                        x.Id,
                        x.Name,
                        x.Username, // Added
                        x.Email,
                        x.ContactNo,
                        x.Gender,
                        x.Role,
                        x.DOJ,
                        x.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (data == null)
                    return new ResponseResult("Fail", "Staff not found");

                return new ResponseResult("OK", data);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ UPDATE STAFF
        public async Task<ResponseResult> UpdateStaff(StaffMaster model)
        {
            try
            {
                if (model == null)
                    return new ResponseResult("Fail", "Staff data is required");

                var existing = await _dbContext.tbl_StaffMaster
                    .FirstOrDefaultAsync(x => x.Id == model.Id && !x.IsDeleted);

                if (existing == null)
                    return new ResponseResult("Fail", "Staff not found");

                // Duplicate Username check
                if (await _dbContext.tbl_StaffMaster
                    .AnyAsync(x => x.Username == model.Username && x.Id != model.Id && !x.IsDeleted))
                {
                    return new ResponseResult("Fail", "Username already taken by another staff");
                }

                // Duplicate Email check
                if (await _dbContext.tbl_StaffMaster
                    .AnyAsync(x => x.Email == model.Email && x.Id != model.Id && !x.IsDeleted))
                {
                    return new ResponseResult("Fail", "Email already exists");
                }

                existing.Name = model.Name;
                existing.Username = model.Username; // Added
                existing.Email = model.Email;
                existing.ContactNo = model.ContactNo;
                existing.Gender = model.Gender;
                existing.Role = model.Role;
                existing.DOJ = model.DOJ;
                existing.UpdatedAt = DateTime.Now;

                // Only update password if a new one is provided
                if (!string.IsNullOrEmpty(model.Password))
                {
                    existing.Password = model.Password;
                }

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Staff updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ✅ DELETE STAFF (Soft Delete)
        public async Task<ResponseResult> DeleteStaff(int id)
        {
            try
            {
                var staff = await _dbContext.tbl_StaffMaster
                    .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

                if (staff == null)
                    return new ResponseResult("Fail", "Staff not found");

                staff.IsDeleted = true;
                staff.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Staff deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}