using BusinessLayer.Interface;
using BusinessLayer.Models;
using BusinessLayer.Models.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseController : ControllerBase
    {
        private readonly IPurchase _managePurchase;

        public PurchaseController(IPurchase managePurchase)
        {
            _managePurchase = managePurchase;
        }

        // ✅ GET ALL
        [HttpGet("GetAllPurchases")]
        public async Task<IActionResult> GetAllPurchases()
        {
            try
            {
                var result = await _managePurchase.GetAllPurchases();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY ID
        [HttpGet("GetPurchaseById/{id}")]
        public async Task<IActionResult> GetPurchaseById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ResponseResult("Fail", "Invalid Purchase Id"));

                var result = await _managePurchase.GetPurchaseById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE
        [HttpPost("SavePurchase")]
        public async Task<IActionResult> SavePurchase([FromBody] Purchase purchase)
        {
            try
            {
                if (purchase == null)
                    return BadRequest(new ResponseResult("Fail", "Purchase data is required"));

                if (purchase.VendorId <= 0)
                    return BadRequest(new ResponseResult("Fail", "Vendor Id is required"));

              

                if (purchase.GrossAmount <= 0)
                    return BadRequest(new ResponseResult("Fail", "Gross Amount must be greater than 0"));

                var result = await _managePurchase.SavePurchase(purchase);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE
        [HttpPut("UpdatePurchase")]
        public async Task<IActionResult> UpdatePurchase([FromBody] Purchase purchase)
        {
            try
            {
                if (purchase == null)
                    return BadRequest(new ResponseResult("Fail", "Purchase data is required"));

                if (purchase.Id <= 0)
                    return BadRequest(new ResponseResult("Fail", "Invalid Purchase Id"));

                var result = await _managePurchase.UpdatePurchase(purchase);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE
        [HttpDelete("DeletePurchase/{id}")]
        public async Task<IActionResult> DeletePurchase(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ResponseResult("Fail", "Invalid Purchase Id"));

                var result = await _managePurchase.DeletePurchase(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}
