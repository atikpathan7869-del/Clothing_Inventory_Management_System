using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentMasterController : ControllerBase
    {
        private readonly IPaymentMaster _managePayment;

        public PaymentMasterController(IPaymentMaster managePayment)
        {
            _managePayment = managePayment;
        }

        // ✅ GET ALL
        [HttpGet("GetAllPayments")]
        public async Task<IActionResult> GetAllPayments()
        {
            try
            {
                var result = await _managePayment.GetAllPayments();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY ID
        [HttpGet("GetPaymentById/{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            try
            {
                var result = await _managePayment.GetPaymentById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ SAVE
        [HttpPost("AddPayment")]
        public async Task<IActionResult> AddPayment([FromBody] PaymentMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Payment data is required"));

                var result = await _managePayment.AddPayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ UPDATE
        [HttpPut("UpdatePayment")]
        public async Task<IActionResult> UpdatePayment([FromBody] PaymentMaster model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Payment data is required"));

                var result = await _managePayment.UpdatePayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ DELETE
        [HttpDelete("DeletePayment/{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            try
            {
                var result = await _managePayment.DeletePayment(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY VENDOR
        [HttpGet("GetPaymentsByVendor/{vendorId}")]
        public async Task<IActionResult> GetPaymentsByVendor(int vendorId)
        {
            try
            {
                var result = await _managePayment.GetPaymentsByVendorId(vendorId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BY FINANCIAL YEAR
        [HttpGet("GetPaymentsByFinancialYear/{financialYearId}")]
        public async Task<IActionResult> GetPaymentsByFinancialYear(int financialYearId)
        {
            try
            {
                var result = await _managePayment.GetPaymentsByFinancialYearId(financialYearId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
        // ✅ GET PAYMENT DUES
        [HttpGet("GetPaymentDues")]
        public async Task<IActionResult> GetPaymentDues()
        {
            try
            {
                var result = await _managePayment.getPaymentDues();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ✅ GET BALANCE SHEET BY VENDOR
        [HttpGet("GetBalanceSheet/{vendorId}")]
        public async Task<IActionResult> GetBalanceSheet(int vendorId)
        {
            try
            {
                var result = await _managePayment.getBalanceSheet(vendorId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}