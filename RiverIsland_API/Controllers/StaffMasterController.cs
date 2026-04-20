using BusinessLayer.Interface;
using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffMasterController : ControllerBase
    {
        private readonly IStaffMaster _manageStaff;

        public StaffMasterController(IStaffMaster manageStaff)
        {
            _manageStaff = manageStaff;
        }

        // ✅ GET ALL STAFF
        [HttpGet("GetAllStaff")]
        public async Task<IActionResult> GetAllStaff()
        {
            try
            {
                var result = await _manageStaff.GetAllStaff();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET STAFF BY ID
        [HttpGet("GetStaffById/{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            try
            {
                var result = await _manageStaff.GetStaffById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE STAFF
        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddStaff([FromBody] StaffMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Staff data is required"));

                var result = await _manageStaff.SaveStaff(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE STAFF
        [HttpPut("UpdateStaff")]
        public async Task<IActionResult> UpdateStaff([FromBody] StaffMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Staff data is required"));

                var result = await _manageStaff.UpdateStaff(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        // ✅ STAFF LOGIN (Updated for Email or Username)
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new ResponseResult("Fail", "Invalid Request"));

                // Passing 'Identifier' which could be Email or Username
                var result = await _manageStaff.LoginStaff(request.Identifier, request.Password);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // Add this at the bottom of your Controller file or in Models
        public class LoginRequest
        {
            public string Identifier { get; set; } = string.Empty; // This will hold Email OR Username
            public string Password { get; set; } = string.Empty;
        }

        // ✅ DELETE STAFF (Soft Delete)
        [HttpDelete("DeleteStaff/{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var result = await _manageStaff.DeleteStaff(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}