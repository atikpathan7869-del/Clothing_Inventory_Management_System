using BusinessLayer.Interface;
using BusinessLayer.Model;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdmin _admin;

        public AdminController(IAdmin admin)
        {
            _admin = admin;
        }

        // ================= SIGN UP =================
        [HttpPost("SignUp")]
        public async Task<IActionResult> SignUp([FromBody] Admin admin)
        {
            try
            {
                var result = await _admin.SignUp(admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= SIGN IN =================
        [HttpPost("SignIn")]
        public async Task<IActionResult> SignIn(string email, string password)
        {
            try
            {
                var result = await _admin.SignIn(email, password);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= SAVE ADMIN =================
        [HttpPost("SaveAdmin")]
        public async Task<IActionResult> SaveAdmin([FromBody] Admin admin)
        {
            try
            {
                var result = await _admin.saveAdmin(admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= LIST =================
        [HttpGet("ListAdmin")]
        public async Task<IActionResult> ListAdmin()
        {
            try
            {
                var result = await _admin.listAdmin();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetAdminById/{id}")]
        public async Task<IActionResult> GetAdminById(int id)
        {
            try
            {
                var result = await _admin.getAdminById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= UPDATE =================
        [HttpPut("UpdateAdmin")]
        public async Task<IActionResult> UpdateAdmin([FromBody] Admin admin)
        {
            try
            {
                var result = await _admin.updateAdmin(admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteAdmin/{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            try
            {
                var result = await _admin.deleteAdmin(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= CHANGE PASSWORD =================
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword(int id, string oldPassword, string newPassword)
        {
            try
            {
                var result = await _admin.ChangePassword(id, oldPassword, newPassword);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= CHANGE PROFILE =================
        [HttpPut("ChangeProfile")]
        public async Task<IActionResult> ChangeProfile([FromBody] Admin admin)
        {
            try
            {
                var result = await _admin.ChangeProfile(admin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= FORGOT PASSWORD =================
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            try
            {
                var result = await _admin.ForgotPassword(email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}