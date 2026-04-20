using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendorController : ControllerBase
    {
        private readonly IVendor _manageVendor;

        public VendorController(IVendor manageVendor)
        {
            _manageVendor = manageVendor;
        }

        // ✅ GET ALL VENDORS
        [HttpGet("GetAllVendors")]
        public async Task<IActionResult> GetAllVendors()
        {
            try
            {
                var result = await _manageVendor.GetAllVendors();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET VENDOR BY ID
        [HttpGet("GetVendorById/{id}")]
        public async Task<IActionResult> GetVendorById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ResponseResult("Fail", "Invalid Vendor Id"));

                var result = await _manageVendor.GetVendorById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE VENDOR
        [HttpPost("SaveVendor")]
        public async Task<IActionResult> SaveVendor([FromBody] Vendor vendor)
        {
            try
            {
                if (vendor == null)
                    return BadRequest(new ResponseResult("Fail", "Vendor data is required"));

                if (string.IsNullOrWhiteSpace(vendor.Name))
                    return BadRequest(new ResponseResult("Fail", "Vendor Name is required"));

                if (string.IsNullOrWhiteSpace(vendor.ContactPerson))
                    return BadRequest(new ResponseResult("Fail", "Contact Person is required"));

                if (string.IsNullOrWhiteSpace(vendor.GSTIN))
                    return BadRequest(new ResponseResult("Fail", "GSTIN is required"));

                var result = await _manageVendor.SaveVendor(vendor);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE VENDOR
        [HttpPut("UpdateVendor")]
        public async Task<IActionResult> UpdateVendor([FromBody] Vendor vendor)
        {
            try
            {
                if (vendor == null)
                    return BadRequest(new ResponseResult("Fail", "Vendor data is required"));

                if (vendor.Id <= 0)
                    return BadRequest(new ResponseResult("Fail", "Invalid Vendor Id"));

                if (string.IsNullOrWhiteSpace(vendor.Name))
                    return BadRequest(new ResponseResult("Fail", "Vendor Name is required"));

                var result = await _manageVendor.UpdateVendor(vendor);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE VENDOR
        [HttpDelete("DeleteVendor/{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ResponseResult("Fail", "Invalid Vendor Id"));

                var result = await _manageVendor.DeleteVendor(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}
