using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseDetailsController : ControllerBase
    {
        private readonly IPurchaseDetails _managePurchaseDetails;

        public PurchaseDetailsController(IPurchaseDetails managePurchaseDetails)
        {
            _managePurchaseDetails = managePurchaseDetails;
        }

        // ✅ GET ALL
        [HttpGet("GetAllPurchaseDetails")]
        public async Task<IActionResult> GetAllPurchaseDetails()
        {
            try
            {
                var result = await _managePurchaseDetails.GetAllPurchaseDetails();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY ID
        [HttpGet("GetPurchaseDetailsById/{id}")]
        public async Task<IActionResult> GetPurchaseDetailsById(int id)
        {
            try
            {
                var result = await _managePurchaseDetails.GetPurchaseDetailsById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY PURCHASE ID (Invoice Wise)
        [HttpGet("GetPurchaseDetailsByPurchaseId/{purchaseId}")]
        public async Task<IActionResult> GetPurchaseDetailsByPurchaseId(int purchaseId)
        {
            try
            {
                var result = await _managePurchaseDetails.GetPurchaseDetailsByPurchaseId(purchaseId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ ADD
        [HttpPost("AddPurchaseDetails")]
        public async Task<IActionResult> AddPurchaseDetails([FromBody] PurchaseDetails model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "PurchaseDetails data required"));

                var result = await _managePurchaseDetails.AddPurchaseDetails(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE
        [HttpPut("UpdatePurchaseDetails")]
        public async Task<IActionResult> UpdatePurchaseDetails([FromBody] PurchaseDetails model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "PurchaseDetails data required"));

                var result = await _managePurchaseDetails.UpdatePurchaseDetails(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE (Soft Delete)
        [HttpDelete("DeletePurchaseDetails/{id}")]
        public async Task<IActionResult> DeletePurchaseDetails(int id)
        {
            try
            {
                var result = await _managePurchaseDetails.DeletePurchaseDetails(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}