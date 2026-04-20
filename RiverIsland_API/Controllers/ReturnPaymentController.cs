using BusinessLayer.Interface;
using BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace RiverIsland_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReturnPaymentController : ControllerBase
    {
        private readonly IReturnPayment _manageReturnPayment;

        public ReturnPaymentController(IReturnPayment manageReturnPayment)
        {
            _manageReturnPayment = manageReturnPayment;
        }

        // ================= GET ALL =================
        [HttpGet("GetAllReturnPayments")]
        public async Task<IActionResult> GetAllReturnPayments()
        {
            try
            {
                var result = await _manageReturnPayment.GetAllReturnPayments();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY ID =================
        [HttpGet("GetReturnPaymentById/{id}")]
        public async Task<IActionResult> GetReturnPaymentById(int id)
        {
            try
            {
                var result = await _manageReturnPayment.GetReturnPaymentById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= GET BY SALES RETURN =================
        [HttpGet("GetReturnPaymentsBySalesReturnId/{salesReturnId}")]
        public async Task<IActionResult> GetReturnPaymentsBySalesReturnId(int salesReturnId)
        {
            try
            {
                var result = await _manageReturnPayment.GetReturnPaymentsBySalesReturnId(salesReturnId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= SAVE =================
        [HttpPost("AddReturnPayment")]
        public async Task<IActionResult> AddReturnPayment([FromBody] ReturnPayment model)
        {
            try
            {
                if (model == null)
                    return BadRequest(new ResponseResult("Fail", "Return payment data is required"));

                var result = await _manageReturnPayment.SaveReturnPayment(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }

        // ================= DELETE =================
        [HttpDelete("DeleteReturnPayment/{id}")]
        public async Task<IActionResult> DeleteReturnPayment(int id)
        {
            try
            {
                var result = await _manageReturnPayment.DeleteReturnPayment(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseResult("Fail", ex.Message));
            }
        }
    }
}