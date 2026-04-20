using BCrypt.Net;
using BusinessLayer.Interface;
using BusinessLayer.Model;
using BusinessLayer.Models;
using DatabaseLayer.ApplicationContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace DataBaseLayer.Repositories
{
    public class AdminRepository : IAdmin
    {
        private readonly ApplicationDBContext _dbContext;
        private readonly EmailService _emailService;

        public AdminRepository(ApplicationDBContext dbContext, EmailService emailService)
        {
            _dbContext = dbContext;
            _emailService = emailService;
        }

        // ================= SIGN UP =================
        public async Task<ResponseResult> SignUp(Admin admin)
        {
            try
            {
                if (admin == null)
                    return new ResponseResult("Fail", "Admin data required");

                if (await _dbContext.tbl_Admin.AnyAsync(x => x.Email == admin.Email))
                    return new ResponseResult("Fail", "Email already exists");

                if (await _dbContext.tbl_Admin.AnyAsync(x => x.Contact_No == admin.Contact_No))
                    return new ResponseResult("Fail", "Contact number already exists");

                string plainPassword = admin.Password;

                admin.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
                admin.CreatedAt = DateTime.Now;
                admin.UpdatedAt = DateTime.Now;

                await _dbContext.tbl_Admin.AddAsync(admin);
                await _dbContext.SaveChangesAsync();

                // HTML Email Template
                string htmlMessage = $@"
                <div style='font-family:Arial;padding:20px'>
                    <h2>Welcome {admin.Full_Name} 👋</h2>
                    <p>Your admin account has been created successfully.</p>
                    <p><b>Email:</b> {admin.Email}</p>
                    <p><b>Password:</b> {plainPassword}</p>
                    <p style='color:red;'>Please change your password after first login.</p>
                </div>";

                await _emailService.SendEmailAsync(
                    admin.Email,
                    "Welcome to Admin Panel",
                    htmlMessage
                );

                return new ResponseResult("OK", new
                {
                    admin.Id,
                    admin.Full_Name,
                    admin.Email,
                    admin.Contact_No
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= SIGN IN =================
        public async Task<ResponseResult> SignIn(string email, string password)
        {
            try
            {
                var admin = await _dbContext.tbl_Admin
                    .FirstOrDefaultAsync(x => x.Email == email);

                if (admin == null)
                    return new ResponseResult("Fail", "Invalid email or password");

                if (!BCrypt.Net.BCrypt.Verify(password, admin.Password))
                    return new ResponseResult("Fail", "Invalid email or password");

                return new ResponseResult("OK", new
                {
                    admin.Id,
                    admin.Full_Name,
                    admin.Email,
                    admin.Contact_No,
                    Financial_year = _dbContext.tbl_Financial_Year.Select(o=> new
                    {
                        o.Id,
                        o.IsActive,
                        o.Name
                    }).FirstOrDefault(i => i.IsActive == true)
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= SAVE ADMIN =================
        public async Task<ResponseResult> saveAdmin(Admin admin)
        {
            try
            {
                if (await _dbContext.tbl_Admin.AnyAsync(x => x.Email == admin.Email))
                    return new ResponseResult("Fail", "Email already exists");

                if (await _dbContext.tbl_Admin.AnyAsync(x => x.Contact_No == admin.Contact_No))
                    return new ResponseResult("Fail", "Contact number already exists");

                admin.Password = BCrypt.Net.BCrypt.HashPassword(admin.Password);
                admin.CreatedAt = DateTime.Now;
                admin.UpdatedAt = DateTime.Now;

                await _dbContext.tbl_Admin.AddAsync(admin);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", new
                {
                    admin.Id,
                    admin.Full_Name,
                    admin.Email,
                    admin.Contact_No
                });
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= LIST ADMIN =================
        public async Task<ResponseResult> listAdmin()
        {
            try
            {
                var list = await _dbContext.tbl_Admin
                    .Select(x => new
                    {
                        x.Id,
                        x.Full_Name,
                        x.Email,
                        x.Contact_No,
                        x.CreatedAt
                    })
                    .ToListAsync();

                return new ResponseResult("OK", list);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= GET BY ID =================
        public async Task<ResponseResult> getAdminById(int id)
        {
            try
            {
                var admin = await _dbContext.tbl_Admin
                    .Where(x => x.Id == id)
                    .Select(x => new
                    {
                        x.Id,
                        x.Full_Name,
                        x.Email,
                        x.Contact_No,
                        x.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (admin == null)
                    return new ResponseResult("Fail", "Admin not found");

                return new ResponseResult("OK", admin);
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= UPDATE =================
        public async Task<ResponseResult> updateAdmin(Admin admin)
        {
            try
            {
                var existing = await _dbContext.tbl_Admin
                    .FirstOrDefaultAsync(x => x.Id == admin.Id);

                if (existing == null)
                    return new ResponseResult("Fail", "Admin not found");

                if (await _dbContext.tbl_Admin.AnyAsync(x => x.Email == admin.Email && x.Id != admin.Id))
                    return new ResponseResult("Fail", "Email already exists");

                existing.Full_Name = admin.Full_Name;
                existing.Email = admin.Email;
                existing.Contact_No = admin.Contact_No;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Admin updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= DELETE =================
        public async Task<ResponseResult> deleteAdmin(int id)
        {
            try
            {
                var admin = await _dbContext.tbl_Admin
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (admin == null)
                    return new ResponseResult("Fail", "Admin not found");

                _dbContext.tbl_Admin.Remove(admin);
                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Admin deleted successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= CHANGE PASSWORD =================
        public async Task<ResponseResult> ChangePassword(int id, string oldPassword, string newPassword)
        {
            try
            {
                var admin = await _dbContext.tbl_Admin
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (admin == null)
                    return new ResponseResult("Fail", "Admin not found");

                if (!BCrypt.Net.BCrypt.Verify(oldPassword, admin.Password))
                    return new ResponseResult("Fail", "Old password incorrect");

                admin.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
                admin.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Password changed successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= CHANGE PROFILE =================
        public async Task<ResponseResult> ChangeProfile(Admin admin)
        {
            try
            {
                var existing = await _dbContext.tbl_Admin
                    .FirstOrDefaultAsync(x => x.Id == admin.Id);

                if (existing == null)
                    return new ResponseResult("Fail", "Admin not found");

                existing.Full_Name = admin.Full_Name;
                existing.Email = admin.Email;
                existing.Contact_No = admin.Contact_No;
                existing.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                return new ResponseResult("OK", "Profile updated successfully");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }

        // ================= FORGOT PASSWORD =================
        public async Task<ResponseResult> ForgotPassword(string email)
        {
            try
            {
                var admin = await _dbContext.tbl_Admin
                    .FirstOrDefaultAsync(x => x.Email == email);

                if (admin == null)
                    return new ResponseResult("Fail", "Email not found");

                string newPassword = Guid.NewGuid().ToString().Substring(0, 8);

                admin.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
                admin.UpdatedAt = DateTime.Now;

                await _dbContext.SaveChangesAsync();

                await _emailService.SendEmailAsync(
                    admin.Email,
                    "Password Reset",
                    $"<h3>Your new password is: {newPassword}</h3>"
                );

                return new ResponseResult("OK", "New password sent to email");
            }
            catch (Exception ex)
            {
                return new ResponseResult("Fail", ex.Message);
            }
        }
    }
}