using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchasePaymentController : ControllerBase
    {
        private readonly IPurchasePayment _managePurchasePayment;

        public PurchasePaymentController(IPurchasePayment managePurchasePayment)
        {
            _managePurchasePayment = managePurchasePayment;
        }

        // ✅ GET ALL
        [HttpGet("GetAllPurchasePayments")]
        public async Task<IActionResult> GetAllPurchasePayments()
        {
            try
            {
                var result = await _managePurchasePayment.GetAllPurchasePayments();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY ID
        [HttpGet("GetPurchasePaymentById/{id}")]
        public async Task<IActionResult> GetPurchasePaymentById(int id)
        {
            try
            {
                var result = await _managePurchasePayment.GetPurchasePaymentById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE
        [HttpPost("AddPurchasePayment")]
        public async Task<IActionResult> AddPurchasePayment([FromBody] PurchasePayment model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "PurchasePayment data is required"));

                var result = await _managePurchasePayment.SavePurchasePayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE
        [HttpPut("UpdatePurchasePayment")]
        public async Task<IActionResult> UpdatePurchasePayment([FromBody] PurchasePayment model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "PurchasePayment data is required"));

                var result = await _managePurchasePayment.UpdatePurchasePayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE
        [HttpDelete("DeletePurchasePayment/{id}")]
        public async Task<IActionResult> DeletePurchasePayment(int id)
        {
            try
            {
                var result = await _managePurchasePayment.DeletePurchasePayment(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}